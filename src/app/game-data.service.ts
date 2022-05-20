import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { BehaviorSubject } from 'rxjs';

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
}

@Injectable({
  providedIn: 'root'
})
export class GameDataService {

  public peopleSubj: BehaviorSubject<FirebasePeopleRecord[]> =
    new BehaviorSubject<FirebasePeopleRecord[]>(null);

  private chosenGameMode: string = null;
  /**
   * The current person being shown for the user to guess.
   */
  private currentPerson = 1;
  private numPersonsInQuiz = 5;

  private people: FirebasePeopleRecord[] = [];

  constructor(
    private db: AngularFirestore,
    private afStorage: AngularFireStorage,
  ) {
    this.db.collection<FirebasePeopleRecord>('people').valueChanges().subscribe(
      people => {
        this.people = people;
        console.log(JSON.stringify(this.people, null, 2));
        this.peopleSubj.next(this.people);
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
}
