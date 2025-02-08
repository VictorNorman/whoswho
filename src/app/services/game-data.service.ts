import { computed, inject, Injectable, signal } from '@angular/core';
import {
  Firestore, doc, getDoc, Timestamp, collection,
  query, where, collectionData, orderBy, limit
} from '@angular/fire/firestore';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { first, Observable, Subject } from 'rxjs';
import { Storage } from '@ionic/storage-angular';



export const GAME_MODES: string[] = [
  'Multiple choice',
  'First name multiple choice',
  'First name only',
  'Last name only',
  'Full name required',
] as const;

// Convert the array into a union type: thanks to ChatGPT.
export type GameMode = typeof GAME_MODES[number];

type DailyOrCustomQuiz = 'Daily quiz' | 'Custom quiz';

interface FirestorePeopleRecord {
  id: string;
  belongsTo: string;
  firstName: string;
  lastName: string;
  nickName: string;
  imageData: string;
}

interface FirestoreOrgRecord {
  organization: string;
  secret: string;
}


interface FirestoreDailyQuizPeople {
  people: Array<string>;
  timestamp: Timestamp;
}

interface PeopleDataState {
  people: FirestorePeopleRecord[];
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GameDataService {

  private fs = inject(Firestore);
  private storage = inject(Storage);

  // state

  private org = '';
  private peopleState = signal<PeopleDataState>({
    people: [],
    loading: true,
  });
  // multiple choice, first name multiple choice, first name only, etc.
  private gameModeState = signal<GameMode>('');

  private quizState = signal({
    currentPersonIdx: 0,
    quizPeople: [] as FirestorePeopleRecord[],
    userAnswerIsCorrect: null as null | boolean,  // boolean when answer is given.
    score: 0,
    quizIsOver: false,
    numPersonsInQuiz: 0,
    peopleMissedIds: [] as string[],  // people who were missed in the quiz.
  });

  // store this to compute how many days in a row the daily quiz has been done.
  private todaysDailyQuizDayOfTheWeek = -1;   // uninitialized
  private lastDayPlayedDailyQuiz = -1;
  private streakNum = -1;   // how many days the player has played in a row.

  // selectors
  // People state selectors
  public loading$ = computed(() => this.peopleState().loading);
  public people$ = computed(() => this.peopleState().people);
  public maxPeople$ = computed(() => this.peopleState().people.length);

  // Quiz State selectors
  public currentPersonIdx$ = computed(() => this.quizState().currentPersonIdx);
  public gameModeUsesMCQuestions$ = computed(() =>
    this.gameModeState() === 'Multiple choice'
    || this.gameModeState() === 'First name multiple choice')
    || this.gameModeState() === 'Daily quiz';
  public quizIsOver$ = computed(() => this.quizState().quizIsOver);
  public score$ = computed(() => this.quizState().score);
  public numPersonsInQuiz$ = computed(() => this.quizState().numPersonsInQuiz);

  // sources

  setDailyOrCustomQuiz$ = new Subject<DailyOrCustomQuiz>();
  gameMode$ = this.gameModeState;
  // The boolean parameter indicates if the user guessed correctly or not.
  goToNextPerson$ = new Subject<boolean>();
  isUsersAnswerCorrect$ = new Subject<string>();
  currentPerson$ = computed(() => this.quizState().quizPeople[this.currentPersonIdx$()]);
  resetQuiz$ = new Subject<void>();

  // ids of people we have missed in previous quizzes
  peopleMissedPreviously: string[] = [];

  constructor() {

    this.getStreakInfoFromStorage();
    this.getMissedPeopleListFromStorage();

    // reducers

    this.setDailyOrCustomQuiz$.pipe(takeUntilDestroyed())
      .subscribe((mode: GameMode) => {
        if (mode === 'Daily quiz') {
          this.getDailyQuizFromDb();
        } else if (mode === 'Custom quiz') {
          this.pickPeopleForCustomQuiz();
        }
      });

    this.goToNextPerson$.pipe(takeUntilDestroyed())
      .subscribe((wasCorrectGuess) => {
        this.quizState.update((currState) => {
          return {
            ...currState,
            currentPersonIdx: currState.currentPersonIdx < currState.quizPeople.length - 1 ?
              currState.currentPersonIdx + 1 :
              currState.currentPersonIdx,
            userAnswerIsCorrect: null,
            score: wasCorrectGuess ? currState.score + 1 : currState.score,
            quizIsOver: currState.currentPersonIdx === currState.quizPeople.length - 1,
            peopleMissedIds: wasCorrectGuess ? currState.peopleMissedIds : [
              ...currState.peopleMissedIds,
              currState.quizPeople[currState.currentPersonIdx].id,
            ],
          }
        });
      });

    this.isUsersAnswerCorrect$.pipe(takeUntilDestroyed())
      .subscribe((guess: string) => {
        this.quizState.update((currState) => ({
          ...currState,
          userAnswerIsCorrect: this.isGuessCorrect(guess),
        }));
      });

    this.resetQuiz$.pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.quizState.update((currState) => ({
          ...currState,
          currentPersonIdx: 0,
          userAnswerIsCorrect: null,
          score: 0,
          quizIsOver: false,
        }));
      });

  }

  /**
   * @param org organization name from login screen
   * @param secret secret "password" from login screen
   * @returns Promise<void>: resolved if org and secret are valid, rejected otherwise
   */
  public async checkOrgAndSecretAgainstDb(org: string, secret: string): Promise<void> {
    this.org = '';
    return new Promise<void>(async (resolve, reject) => {
      const docRef = doc(this.fs, `organization/${org}`);
      const orgRec = (await getDoc(docRef)).data() as FirestoreOrgRecord;
      if (!orgRec || orgRec.secret !== secret) {
        reject();
      } else {
        this.org = org;
        resolve();
      }
    });
  }

  public async getAllPeopleFromDb() {
    // TODO: probably better way to do this. And/or complete this code.
    this.quizState.update((currState) => ({
      ...currState,
      currentPersonIdx: 0,
      quizPeople: [],
    }));
    const collRef = collection(this.fs, 'people');
    const q = query(collRef, where('belongsTo', '==', this.org));
    const data = collectionData(q, { idField: 'id' }) as Observable<FirestorePeopleRecord[]>;
    data.pipe(
      first()
    ).subscribe((people) => {
      this.peopleState.update((currState) => ({
        ...currState,
        people: people,
        loading: false,
      }));
    });
  }

  /**
   * set quizPeople to the list of people from the latest dailies entry in the database.
   */
  public getDailyQuizFromDb(): Promise<void> {
    return new Promise<void>((resolve) => {

      const collRef = collection(this.fs, `organization/${this.org}/dailies`);
      const q = query(collRef, orderBy('timestamp', 'desc'), limit(1));
      const data = collectionData(q) as Observable<FirestoreDailyQuizPeople[]>;
      data.pipe(first())
        .subscribe((res) => {
          // We have all the people already, so we can use the ids to just
          // reference the entries in people the people array.
          this.quizState.update((currState) => ({
            ...currState,
            currentPersonIdx: 0,
            quizPeople: res[0].people
              .map(personId => this.people$()
                .find((p) => p.id === personId)) as FirestorePeopleRecord[],
          }));

          const d = res[0].timestamp.toDate();
          this.todaysDailyQuizDayOfTheWeek = d.getDay();
          resolve();
        });
    });
  }

  public pickPeopleForCustomQuiz(): void {
    this.quizState.update((currState) => ({
      ...currState,
      currentPersonIdx: 0,
      quizPeople: this.pickNRandomPeople(),
    }));
  }

  public getMultipleChoiceAnswers(): string[] {
    const answers = this.computeMultipleChoiceAnswers();
    if (this.gameMode$() === 'First name multiple choice') {
      return answers.map(a => a.firstName);
    } else {
      return answers.map(this.makeFullName);
    }
  }

  // build up random wrong answers for the multiple choice format
  private computeMultipleChoiceAnswers(): FirestorePeopleRecord[] {
    const results = [this.currentPerson$()];
    // 4 multiple choice answers total.
    while (results.length !== 4) {
      const person = this.getRandomPerson();
      if (!this.labelPresentForGameMode(results, person)) {
        results.push(person);
      }
    }
    return this.shuffle(results);;
  }

  /**
   * Check if the given person's full name (or first name for 'First name multiple choice')
   * is in the list of loaded people. If so, return true.
   * @param loaded the list of people to check against
   * @param person the person to check if they are in the list
   * @returns true if the person is in the list, false otherwise
   */
  private labelPresentForGameMode(loaded: FirestorePeopleRecord[], person: FirestorePeopleRecord): boolean {
    switch (this.gameMode$()) {
      case 'Multiple choice':
        return loaded.map(this.makeFullName).includes(this.makeFullName(person));
      case 'First name multiple choice':
        return loaded.map(record => record.firstName).includes(person.firstName);
      default:
        return false;
    }
  }

  private getRandomPerson() {
    return this.people$()[Math.floor(Math.random() * this.people$().length)];
  }

  /**
   * Pick N random people when the user selects the "custom quiz".
   * @returns the next person in the quizPeople array.
   */
  private pickNRandomPeople(): FirestorePeopleRecord[] {
    // create a quiz from N random people in the people array.
    const shuffled = this.shuffle(this.people$());
    return shuffled.slice(0, this.numPersonsInQuiz$());
  }

  public getGameModes(): string[] {
    return GAME_MODES;
  }

  public setNumPersonsInQuiz(np: number): void {
    this.quizState.update((currState) => ({
      ...currState,
      numPersonsInQuiz: np,
    }));
  }

  public isGuessCorrect(guess: string): boolean {
    const person = this.currentPerson$();
    switch (this.gameMode$()) {
      case 'Full name required':
      case 'Multiple choice':
      case 'Daily quiz':
        return guess.toUpperCase() === `${person.firstName.toUpperCase()} ${person.lastName.toUpperCase()}` ||
          guess.toUpperCase() === `${person.nickName.toUpperCase()} ${person.lastName.toUpperCase()}`;
      case 'Last name only':
        return guess.toUpperCase() === person.lastName.toUpperCase();
      case 'First name multiple choice':
      case 'First name only':
        return guess.toUpperCase() === person.firstName.toUpperCase() ||
          guess.toUpperCase() === person.nickName.toUpperCase();
      default:
        return false;
    }
  }

  public getCorrectAnswer(): string {
    return `${this.currentPerson$().firstName} ${this.currentPerson$().lastName}`;
  }

  public getDifficulty(mode: string): string {
    switch (mode) {
      case 'Multiple choice': return 'Easy';
      case 'First name multiple choice': return 'Easy';
      case 'First name only': return 'Moderate';
      case 'Last name only': return 'Hard';
      case 'Full name required': return 'Very Hard';
      default: return 'Waaa?';
    }
  }

  public getHint(): string {
    switch (this.gameMode$()) {
      case 'Last name only':
        return `Last name begins with '${this.currentPerson$().lastName[0]}'`;
      case 'First name only':
        return `First name begins with '${this.currentPerson$().firstName[0]}'`;
      case 'Full name required':
        return `This person's initials are ${this.currentPerson$().firstName[0]}${this.currentPerson$().lastName[0]}`;
      default:
        return 'No hint';
    }
  }


  // increment streak info
  public incrementStreak() {
    if (this.lastDayPlayedDailyQuiz === this.todaysDailyQuizDayOfTheWeek) {
      // player played already today, so don't update anything.
      return;
    }
    // console.log((this.lastDayPlayedDailyQuiz + 1) % 7, this.todaysDailyQuizDayOfTheWeek);
    // first time playing the quiz.
    if (this.lastDayPlayedDailyQuiz === -1) {
      this.streakNum = 1;
      // console.log('lastDayPlayedDailyQuiz is -1 so streak set to 1');
    } else if ((this.lastDayPlayedDailyQuiz + 1) % 7 === this.todaysDailyQuizDayOfTheWeek) {
      // played yesterday and now, so streak continues
      this.streakNum++;
    } else {
      // stream was broken to set back to 1 day in a row.
      this.streakNum = 1;
    }
    this.lastDayPlayedDailyQuiz = this.todaysDailyQuizDayOfTheWeek;
    // console.log('lastDPlayedDQ set to todaysDQDoTW which is ', this.todaysDailyQuizDayOfTheWeek);
    this.storage.set('lastDayPlayedDailyQuiz', this.lastDayPlayedDailyQuiz);
    this.storage.set('streak', this.streakNum);
  }

  public getStreak() {
    return this.streakNum;
  }

  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  private shuffle<T>(arr: Array<T>): Array<T> {
    return arr.map(x => [Math.random(), x]).sort(([a], [b]) =>
      (a as number) - (b as number)).map(([_, x]) => x) as T[];
  }

  private makeFullName(person: FirestorePeopleRecord): string {
    return `${person.firstName} ${person.lastName}`;
  }

  private async getStreakInfoFromStorage() {
    await this.storage.create();
    // Get the last day of the week the daily quiz was done, from localStorage.
    const ldpdq = await this.storage.get('lastDayPlayedDailyQuiz');
    this.lastDayPlayedDailyQuiz = ldpdq !== null ? Number(ldpdq) : -1;
    // console.log('getStreakInfoFromStorage: lastDayPlayedDQ = ', this.lastDayPlayedDailyQuiz);
    this.streakNum = Number(await this.storage.get('streak'));  // if not in storage, then 0 -- perfect.
  }

  private async getMissedPeopleListFromStorage() {
    await this.storage.create();
    const missedPeople = await this.storage.get('missedPeople');
    this.peopleMissedPreviously = missedPeople || [];
    console.log("missedPeoplePreviously: ", this.peopleMissedPreviously);
  }


  // add the people who were missed in the quiz to the local storage.
  saveMissedImageBearersToStorage() {
    // console.log('saveMissedImageBearers');
    // Add people to were not previously missed into the total list of people missed.
    this.quizState().peopleMissedIds.forEach(p => {
      if (!this.peopleMissedPreviously.find(m => m === p)) {
        this.peopleMissedPreviously.push(p);
      }
    });

    // Remove people who were gotten right from the list of people missed.
    this.peopleMissedPreviously =
      this.peopleMissedPreviously
        .filter(p =>
          !(
            // this previously missed person is in the quizPeople array
            this.quizState().quizPeople.find(qp => qp.id === p) &&
            // and the person was NOT missed in the quiz.
            !this.quizState().peopleMissedIds.includes(p)
          ));

    this.storage.set('missedPeople', this.peopleMissedPreviously);
  }

}
