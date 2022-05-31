import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';

@Component({
  selector: 'app-choose-mode',
  templateUrl: './choose-mode.page.html',
  styleUrls: ['./choose-mode.page.scss'],
})
export class ChooseModePage implements OnInit {
  public modeChosen = false;
  public numPeople = 5;

  constructor(public gameDataSvc: GameDataService) { }

  ngOnInit() {
  }

  public getGameModes(): string[] {
    return this.gameDataSvc.getGameModes();
  }

  public gameModeSelected(event): void {
    this.modeChosen = true;
    this.gameDataSvc.setGameMode(event.detail.value);
  }

  // the game mode is already saved in the function above.
  public saveSettings(): void {
    this.gameDataSvc.setNumPersonsInQuiz(this.numPeople);
  }

  public customFormatter(value: number): string {
    return `${value}`;
  }


}
