import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject } from 'rxjs';

export const GAME_MODES: string[] = [
  'Multiple Choice',
  'Last name only',
  'First name only',
  'Full name required',
  // 'Daily quiz',   // uses multiple choice
];

interface FirestorePeopleRecord {
  id: string;
  belongsTo: string;
  firstName: string;
  lastName: string;
  nickName: string;
  imageData: string;
}

interface FirebaseOrgRecord {
  organization: string;
  secret: string;
}

interface FirebaseDailyQuizPeople {
  people: Array<{ doc: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class GameDataService {

  public orgLoadedSubj: BehaviorSubject<string> = new BehaviorSubject<string>('not loaded yet');

  private chosenGameMode: string = null;
  /**
   * The current person being shown for the user to guess.
   */
  private currentPerson = 1;
  private numPersonsInQuiz: number;

  private people: FirestorePeopleRecord[] = [];
  private quizPeople: FirestorePeopleRecord[] = [];
  private org: string;

  private score = 0;

  constructor(
    private db: AngularFirestore,
  ) {
  }

  public async checkOrgAndSecretAgainstDb(org: string, secret: string): Promise<void> {
    this.org = null;
    const doc = await this.db.collection<FirebaseOrgRecord>('organization').doc(org).get().toPromise();
    if (!doc.data() || doc.data().secret !== secret) {
      this.orgLoadedSubj.next('bad org or secret');
    } else {
      this.org = org;
      this.getPeopleFromDb();
      this.orgLoadedSubj.next('org loaded');
    }
  }

  public getPeopleFromDb() {
    this.currentPerson = 1;
    this.people = [];
    this.quizPeople = [];
    this.db.collection<FirestorePeopleRecord>('people',
      ref => ref.where('belongsTo', '==', this.org)).valueChanges({ idField: 'id' }).subscribe(
        people => {
          if (people) {
            this.people = people;
            console.log('got people: ', people);
            console.log('calling getDaily');
            this.getDailyQuizFromDb();
          }
        }
      );
  }

  public getGameModes(): string[] {
    return GAME_MODES;
  }

  public setGameMode(mode: string): void {
    console.log('game mode set to ', mode);
    this.chosenGameMode = mode;
  }

  public getGameMode(): string {
    return this.chosenGameMode;
  }

  public incrScore() {
    this.score++;
  }
  public getScore() {
    return this.score;
  }
  public resetScore() {
    this.score = 0;
  }

  public getCurrentPerson(): number {
    return this.currentPerson;
  }

  public resetCurrentPerson(): void {
    this.currentPerson = 1;
  }

  public goToNextPerson(): void {
    if (!this.isEndOfQuiz()) {
      this.currentPerson++;
    }
  }

  public isEndOfQuiz(): boolean {
    return this.currentPerson === this.numPersonsInQuiz;
  }

  public getNumPersonsInQuiz(): number {
    return this.numPersonsInQuiz;
  }

  public getMaxPeople(): number {
    return this.people.length;
  }

  public setNumPersonsInQuiz(np: number): void {
    this.numPersonsInQuiz = np;
  }

  public pickPeopleForQuiz(): void {
      this.quizPeople = this.pickNRandomPeople();
  }

  public getPerson(): FirestorePeopleRecord {
    console.log('getPerson: index is', this.getCurrentPerson() - 1);
    return this.quizPeople[this.getCurrentPerson() - 1];
  }

  public isGuessCorrect(guess: string): boolean {
    switch (this.chosenGameMode) {
      case 'Full name required':
      case 'Multiple Choice':
      case 'Daily quiz':
        return guess.toUpperCase() === `${this.getPerson().firstName.toUpperCase()} ${this.getPerson().lastName.toUpperCase()}` ||
          guess.toUpperCase() === `${this.getPerson().nickName.toUpperCase()} ${this.getPerson().lastName.toUpperCase()}`;
      case 'Last name only':
        return guess.toUpperCase() === this.getPerson().lastName.toUpperCase();
      case 'First name only':
        return guess.toUpperCase() === this.getPerson().firstName.toUpperCase() ||
          guess.toUpperCase() === this.getPerson().nickName.toUpperCase();
    }
  }

  public getCorrectAnswer(): string {
    return `${this.getPerson().firstName} ${this.getPerson().lastName}`;
  }

  public getHint(): string {
    switch (this.chosenGameMode) {
      case 'Last name only':
        return `Last name begins with '${this.getPerson().lastName[0]}'`;
      case 'First name only':
        return `First name begins with '${this.getPerson().firstName[0]}'`;
      case 'Full name required':
        return `This person's initials are ${this.getPerson().firstName[0]}${this.getPerson().lastName[0]}`;
      default:
        return 'No hint';
    }
  }

  // build up random wrong answers for the multiple choice format
  public getMultipleChoiceAnswers(): string[] {
    const results = [this.makeFullName(this.getPerson())];
    // 4 multiple choice answers
    while (results.length !== 4) {
      const person = this.getRandomPerson(this.people);
      const name = this.makeFullName(person);
      if (!results.includes(name)) {
        results.push(name);
      }
    }
    return this.shuffle(results);
  }

  /**
   * set quizPeople to the list of people from the latest dailies entry in the database.
   */
  private getDailyQuizFromDb(): void {
    this.db.collection<FirebaseDailyQuizPeople>(`organization/${this.org}/dailies`,
      ref => ref.orderBy('timestamp', 'desc')).valueChanges().subscribe(
        res => {
          // We have all the people already, so we can use the ids to just
          // reference the entries in people...  TODO: probably want to not
          // pull all people each time.
          this.quizPeople = res[0].people.map(personId =>
            this.people.find((p) => p.id === personId.doc));
          console.log('quiz people retrieved: ', this.quizPeople);
          this.numPersonsInQuiz = this.quizPeople.length;
        });
  }



  private getRandomPerson(people: FirestorePeopleRecord[]) {
    return people[Math.floor(Math.random() * people.length)];
  }

  private makeFullName(person: FirestorePeopleRecord): string {
    return `${person.firstName} ${person.lastName}`;
  }

  private pickNRandomPeople(): FirestorePeopleRecord[] {
    // create a quiz from N random people in the people array.
    const shuffled = this.shuffle(this.people);
    return shuffled.slice(0, this.numPersonsInQuiz);
    // console.log('pick random peopl = ', JSON.stringify(this.quizPeople, null, 2));
  }

  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  private shuffle<T>(arr: Array<T>): Array<T> {
    return arr.map(x => [Math.random(), x]).sort(([a], [b]) =>
      (a as number) - (b as number)).map(([_, x]) => x) as T[];
  }


}
