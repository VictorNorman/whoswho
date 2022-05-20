import { Injectable } from '@angular/core';

export const GAME_MODES: string[] = [
  'Multiple Choice',
  'Last name only',
  'First name only',
  'Full name required',
];

@Injectable({
  providedIn: 'root'
})
export class GameDataService {

  private chosenGameMode: string = null;

  constructor() { }

  public getGameModes(): string[] {
    return GAME_MODES;
  }

  public setGameMode(mode: string): void {
    this.chosenGameMode = mode;
    // console.log('chosenGameMode = ', this.chosenGameMode);
  }

  public getGameMode(): string {
    return this.chosenGameMode;
  }
}
