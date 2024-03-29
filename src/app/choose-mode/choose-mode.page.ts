import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameDataService } from '../services/game-data.service';

@Component({
  selector: 'app-choose-mode',
  templateUrl: './choose-mode.page.html',
  styleUrls: ['./choose-mode.page.scss'],
})
export class ChooseModePage implements OnInit {
  public modeChosen = false;
  public numPeople = 5;
  public maxPeople = 5;

  constructor(
    public gameDataSvc: GameDataService,
    private router: Router,
  ) {
    this.maxPeople = this.gameDataSvc.getMaxPeople();
  }

  ngOnInit() {

  }

  public async dailyQuiz() {
    this.gameDataSvc.setGameMode('Daily quiz');
    await this.gameDataSvc.getDailyQuizFromDb();
    // I have such timing problems with getting the data and
    // computing the mcanswers, so I'll delay going to the page for a bit.
    setTimeout(() => this.router.navigateByUrl('/choose-difficulty'), 800);
  }

  public getGameModes(): string[] {
    return this.gameDataSvc.getGameModes();
  }

  public gameModeSelected(event: any): void {
    this.modeChosen = true;
    this.gameDataSvc.setGameMode(event.detail.value);
  }

  // the game mode is already saved in the function above.
  public useCustomQuiz(): void {
    // console.log('saving # of persons = ', this.numPeople);
    this.gameDataSvc.setNumPersonsInQuiz(this.numPeople);
    this.gameDataSvc.pickPeopleForQuiz();
    // I have such timing problems with getting the data and
    // computing the mcanswers, so I'll delay going to the page for a bit.
    setTimeout(() => this.router.navigateByUrl('/choose-difficulty'), 500);
  }

  public customFormatter(value: number): string {
    return `${value}`;
  }


}
