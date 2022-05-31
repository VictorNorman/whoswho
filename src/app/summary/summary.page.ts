import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
})
export class SummaryPage implements OnInit {

  constructor(public dataSvc: GameDataService) { }

  ngOnInit() {
  }

  public redoQuiz(): void {
    this.dataSvc.resetCurrentPerson();
    this.dataSvc.resetScore();
  }

  public restart(): void {
    this.dataSvc.resetCurrentPerson();
    this.dataSvc.resetScore();
  }

}
