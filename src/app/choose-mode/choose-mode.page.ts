import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameDataService } from '../services/game-data.service';
import { FormsModule } from '@angular/forms';
import { IonContent, IonImg, IonItem, IonRow, IonButton, IonList } from "@ionic/angular/standalone";
import { MessagingService } from '../services/messaging.service';

@Component({
  selector: 'app-choose-mode',
  templateUrl: './choose-mode.page.html',
  styleUrls: ['./choose-mode.page.scss'],
  standalone: true,
  imports: [
    IonList, IonButton, IonRow, IonItem, IonImg, IonContent,
    FormsModule,
  ]
})
export class ChooseModePage implements OnInit {
  public modeChosen = false;

  public numPeople = 5;   // for custom quiz

  public gameDataSvc = inject(GameDataService);
  private router = inject(Router);
  protected messaging = inject(MessagingService);

  constructor() {
  }

  ngOnInit() {
    // This is called here because once we've routed to this page, the org will have
    // been set, which is required for getting the people from the database.
    this.gameDataSvc.getAllPeopleFromDb();
  }

  public async dailyQuiz() {
    this.gameDataSvc.setDailyOrCustomQuiz$.next('Daily quiz');
    this.gameDataSvc.setNumPersonsInQuiz(10);
    this.router.navigateByUrl('/choose-difficulty');
  }

  public useCustomQuiz(): void {
    this.gameDataSvc.setNumPersonsInQuiz(this.numPeople);
    this.gameDataSvc.setDailyOrCustomQuiz$.next('Custom quiz');
    this.router.navigateByUrl('/choose-difficulty');
  }

}
