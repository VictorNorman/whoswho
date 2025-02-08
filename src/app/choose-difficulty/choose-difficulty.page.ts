import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonItem, IonRadioGroup, IonGrid, IonRow, IonCol, IonLabel, IonRadio, IonButton,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { GameDataService, GameMode } from '../services/game-data.service';

@Component({
  templateUrl: './choose-difficulty.page.html',
  styleUrls: ['./choose-difficulty.page.scss'],
  standalone: true,
  imports: [IonButton, IonRadio, IonLabel, IonCol, IonRow, IonGrid, IonRadioGroup, IonItem, IonContent,
    CommonModule, FormsModule,
  ]
})
export class ChooseDifficultyPage implements OnInit {
  public gameDataSvc = inject(GameDataService);
  private router = inject(Router);

  modeChosen = false;
  constructor() { }

  ngOnInit() { }

  public getGameModes(): string[] {
    return this.gameDataSvc.getGameModes();
  }

  public gameModeSelected(event: any): void {
    this.modeChosen = true;
    this.gameDataSvc.gameMode$.set(event.detail.value as GameMode);
  }



  public goToQuizPage() {
    this.router.navigate(['/quiz']);
  }

}
