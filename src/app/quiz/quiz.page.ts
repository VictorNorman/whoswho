import { Component, computed, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, IonListHeader, IonLabel } from '@ionic/angular/standalone';
import { GameDataService } from '../services/game-data.service';
import {
  IonContent, IonImg, IonItem, IonRow, IonButton, IonList, IonModal,
  IonIcon, IonText, IonProgressBar,
  IonRadioGroup, IonRadio, IonInput, ToastController,
} from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { thumbsDownSharp, thumbsUpSharp } from 'ionicons/icons';

@Component({
  selector: 'app-quiz',
  templateUrl: 'quiz.page.html',
  styleUrls: ['quiz.page.scss'],
  standalone: true,
  imports: [IonLabel, IonListHeader,
    IonRow, IonList, IonItem,
    IonContent, IonProgressBar,
    IonImg, IonInput, IonButton,
    IonModal, IonText, IonIcon,
    IonRadioGroup, IonRadio,
    FormsModule,
  ],
})
export class QuizPage implements OnInit {

  @ViewChild('radiogroup', { static: false }) radioGroup!: IonRadioGroup;

  gameDataSvc = inject(GameDataService);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private toastCtrlr = inject(ToastController);

  public title = 'Image Bearers';
  public guess = '';   // the user's guess of who this is.
  public guessIsCorrect = false;
  public mcAnswers: string[] = [];

  constructor() {
    addIcons({ thumbsUpSharp, thumbsDownSharp });
  }

  ngOnInit() {
    // When we get here, if we are doing a quiz with multiple choice answers,
    // compute those answer now for the first person.
    if (this.gameDataSvc.gameModeUsesMCQuestions$()) {
      this.mcAnswers = this.gameDataSvc.getMultipleChoiceAnswers();
    }
  }

  // When multiple choice selected.
  public choiceSelected(event: any) {
    this.guess = event.detail.value;
  }

  // Clean up previous guess if we navigate back to this page.
  ionViewWillEnter() {
    this.guess = '';
    this.guessIsCorrect = false;
    if (this.gameDataSvc.gameModeUsesMCQuestions$()) {
      this.mcAnswers = this.gameDataSvc.getMultipleChoiceAnswers();
    }
  }


  public isGuessCorrect(): boolean {
    return this.gameDataSvc.isGuessCorrect(this.guess);
  }

  async dismiss() {
    await this.modalCtrl.dismiss(null, 'confirm');

    this.gameDataSvc.goToNextPerson$.next(this.isGuessCorrect());
    this.guess = '';

    if (this.gameDataSvc.quizIsOver$()) {
      this.router.navigateByUrl('summary');
      return;
    }

    this.guessIsCorrect = false;
    this.guess = '';

    // For multiple choice questions, load up some new random answers.
    if (this.gameDataSvc.gameModeUsesMCQuestions$()) {
      this.mcAnswers = this.gameDataSvc.getMultipleChoiceAnswers();

      // Clear the choice in the radio group.
      this.radioGroup.value = '';
    }
  }

  async showHint() {
    const toast = await this.toastCtrlr.create({
      message: this.gameDataSvc.getHint(),
      duration: 2000,
    });
    toast.present();
  }

  async handleSubmit() {
    this.guess = this.guess.trim();
  }

  gameModePlaceHolderText$ = computed(() => {
    switch (this.gameDataSvc.gameMode$()) {
      case 'First name multiple choice':
      case 'Multiple choice':
        return 'Not used';
      case 'Last name only':
        return 'Enter last name';
      case 'First name only':
        return 'Enter first name';
      case 'Full name required':
        return 'Enter full name';
      default:
        return 'unknown';
    }
  });



}
