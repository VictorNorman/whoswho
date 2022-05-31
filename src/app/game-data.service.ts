import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject } from 'rxjs';

export const GAME_MODES: string[] = [
  'Multiple Choice',
  'Last name only',
  'First name only',
  'Full name required',
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
  private numPersonsInQuiz = 5;  // default

  private people: FirestorePeopleRecord[] = [];
  private quizPeople: FirestorePeopleRecord[] = [];
  private org: string;

  private score = 0;

  constructor(
    private db: AngularFirestore,
  ) {
  }

  public checkOrgAndSecretAgainstDb(org: string, secret: string): void {
    this.org = null;
    this.db.collection<FirebaseOrgRecord>('organization',
      ref => ref.where('organization', '==', org)).valueChanges().subscribe(
        orgs => {
          if (orgs.length === 0 || orgs[0].secret !== secret) {
            this.orgLoadedSubj.next('bad org or secret');
          } else {
            this.org = org;
            this.getPeopleFromDb();
            this.orgLoadedSubj.next('org loaded');
          }
        }
      );
  }

  public getPeopleFromDb() {
    this.currentPerson = 1;
    this.people = [];
    this.quizPeople = [];
    this.db.collection<FirestorePeopleRecord>('people',
      ref => ref.where('belongsTo', '==', this.org)).valueChanges().subscribe(
        people => {
          if (people) {
            this.people = people;
            console.log('got people: ', people);
          }
        }
      );
  }

  public getGameModes(): string[] {
    return GAME_MODES;
  }

  public setGameMode(mode: string): void {
    this.chosenGameMode = mode;
  }

  public getGameMode(): string {
    return this.chosenGameMode;
  }

  public incrScore() {
    this.score++;
    console.log('incrScore to ', this.score);
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

  // set the number of people to be in the quiz, and get those random people from
  // the whole list.
  public setNumPersonsInQuiz(np: number): void {
    this.numPersonsInQuiz = np;
    this.pickNRandomPeople();
  }

  public getPerson(): FirestorePeopleRecord {
    return this.quizPeople[this.getCurrentPerson() - 1];
  }

  public isGuessCorrect(guess: string): boolean {
    switch (this.chosenGameMode) {
      case 'Full name required':
      case 'Multiple Choice':
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


  private getRandomPerson(people: FirestorePeopleRecord[]) {
    return people[Math.floor(Math.random() * people.length)];
  }

  private makeFullName(person: FirestorePeopleRecord): string {
    return `${person.firstName} ${person.lastName}`;
  }

  private pickNRandomPeople(): void {
    // create a quiz from N random people in the people array.
    const shuffled = this.shuffle(this.people);
    this.quizPeople = shuffled.slice(0, this.numPersonsInQuiz);
    // console.log('pick random peopl = ', JSON.stringify(this.quizPeople, null, 2));
  }

  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  private shuffle<T>(arr: Array<T>): Array<T> {
    return arr.map(x => [Math.random(), x]).sort(([a], [b]) =>
      (a as number) - (b as number)).map(([_, x]) => x) as T[];
  }
}
