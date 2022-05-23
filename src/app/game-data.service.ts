import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';

export const GAME_MODES: string[] = [
  'Multiple Choice',
  'Last name only',
  'First name only',
  'Full name required',
];

interface FirebasePeopleRecord {
  id: string;
  belongsTo: string;
  firstName: string;
  lastName: string;
  nickName: string;
  imageName: string;
  imageUrl?: Observable<any>;
}

@Injectable({
  providedIn: 'root'
})
export class GameDataService {

  private chosenGameMode: string = null;
  /**
   * The current person being shown for the user to guess.
   */
  private currentPerson = 1;
  private numPersonsInQuiz = 5;

  private people: FirebasePeopleRecord[] = [];
  private quizPeople: FirebasePeopleRecord[] = [];

  constructor(
    private db: AngularFirestore,
    private afStorage: AngularFireStorage,
  ) {
    this.initialize();
  }

  public initialize() {
    this.currentPerson = 1;
    this.people = [];
    this.quizPeople = [];
    this.db.collection<FirebasePeopleRecord>('people').valueChanges().subscribe(
      people => {
        this.people = people;
        // console.log(JSON.stringify(this.people, null, 2));
        this.pick5RandomPeople();
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

  public getPerson(): FirebasePeopleRecord {
    // load the picture up
    this.setImageUrl(this.quizPeople[this.getCurrentPerson() - 1]);
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
    while (results.length !== 4) {
      const person = this.getRandomPerson(this.people);
      const name = this.makeFullName(person);
      if (!results.includes(name)) {
        results.push(name);
      }
    }
    return this.shuffle(results);
  }

  private setImageUrl(person: FirebasePeopleRecord) {
    if (!person.imageUrl) {
      person.imageUrl = this.afStorage.ref(person.imageName).getDownloadURL();
    }
  }

  private getRandomPerson(people: FirebasePeopleRecord[]) {
    return people[Math.floor(Math.random() * people.length)];
  }

  private makeFullName(person: FirebasePeopleRecord): string {
    return `${person.firstName} ${person.lastName}`;
  }

  private pick5RandomPeople(): void {
    // create a quiz from 5 random people in the people array.
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
