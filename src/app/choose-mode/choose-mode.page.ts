import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';

@Component({
  selector: 'app-choose-mode',
  templateUrl: './choose-mode.page.html',
  styleUrls: ['./choose-mode.page.scss'],
})
export class ChooseModePage implements OnInit {

  constructor(private gameDataSvc: GameDataService) { }

  ngOnInit() {
  }

  public getGameModes(): string[] {
    return this.gameDataSvc.getGameModes();
  }

  public gameModeSelected(event): void {
    console.log(event.detail.value);
    this.gameDataSvc.setGameMode(event.detail.value);
  }


}
