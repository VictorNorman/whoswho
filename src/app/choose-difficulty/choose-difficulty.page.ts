import { Component } from '@angular/core';
import { GameDataService } from '../services/game-data.service';

@Component({
  selector: 'app-choose-difficulty',
  templateUrl: './choose-difficulty.page.html',
  styleUrls: ['./choose-difficulty.page.scss'],
})
export class ChooseDifficultyPage {

  public modeChosen = false;

  constructor(
    public gameDataSvc: GameDataService,
  ) { }


  public getGameModes(): string[] {
    return this.gameDataSvc.getFreeFormGameModes();
  }

  public gameModeSelected(event: any): void {
    this.modeChosen = true;
    this.gameDataSvc.setGameMode(event.detail.value);
  }

}
