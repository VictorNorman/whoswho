import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameDataService } from '../game-data.service';

@Component({
  selector: 'app-choose-difficulty',
  templateUrl: './choose-difficulty.page.html',
  styleUrls: ['./choose-difficulty.page.scss'],
})
export class ChooseDifficultyPage implements OnInit {

  public modeChosen = false;

  constructor(
    public gameDataSvc: GameDataService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  public getGameModes(): string[] {
    return this.gameDataSvc.getGameModes();
  }

  public gameModeSelected(event): void {
    this.modeChosen = true;
    this.gameDataSvc.setGameMode(event.detail.value);
  }

}
