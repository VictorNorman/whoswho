import { Injectable } from '@angular/core';

export const GAME_MODES: string[] = [
  'Multiple Choice',
  'Last name only',
  'First name only',
  'Full name required',
];

interface FirebasePeopleRecord {
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

  private chosenGameMode: string = null;
  /**
   * The current person being shown for the user to guess.
   */
  private currentPerson = 1;
  private numPersonsInQuiz = 5;

  constructor() {
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
