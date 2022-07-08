import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameDataService } from '../game-data.service';

@Component({
  selector: 'app-choose-mode',
  templateUrl: './choose-mode.page.html',
  styleUrls: ['./choose-mode.page.scss'],
})
export class ChooseModePage implements OnInit {
  public modeChosen = false;
  public numPeople = 10;

  constructor(
    public gameDataSvc: GameDataService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  public async dailyQuiz() {
    this.gameDataSvc.setGameMode('Daily quiz');
    await this.gameDataSvc.getDailyQuizFromDb();
    // I have such timing problems with getting the data and
    // computing the mcanswers, so I'll delay going to the page for a bit.
    setTimeout(() => this.router.navigateByUrl('/quiz'), 500);
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
    this.gameDataSvc.pickPeopleForQuiz();
  }

  public customFormatter(value: number): string {
    return `${value}`;
  }


}
