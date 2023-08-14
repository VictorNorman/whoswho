import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonRadioGroup, ModalController, ToastController } from '@ionic/angular';
import { GameDataService, GameMode } from '../services/game-data.service';

@Component({
  selector: 'app-quiz',
  templateUrl: 'quiz.page.html',
  styleUrls: ['quiz.page.scss'],
})
export class QuizPage {

  @ViewChild('radiogroup', { static: false }) radioGroup!: IonRadioGroup;

  public title = 'Image Bearers';
  public guess = '';   // the user's guess of who this is.
  public guessIsCorrect = false;
  public mcAnswers: string[] = [];

  constructor(public toastCtrlr: ToastController,
    public gameDataSvc: GameDataService,
    private router: Router,
    private modalCtrl: ModalController) {
  }

  // Clean up previous guess if we navigate back to this page.
  ionViewWillEnter() {
    this.guess = '';
    this.guessIsCorrect = false;
    this.gameDataSvc.resetScore();
    if (this.useMCQuestions()) {
      if (this.gameDataSvc.getGameMode() === GameMode.firstNameMultipleChoice) {
        this.mcAnswers = this.gameDataSvc.getMultipleChoiceAnswers().map(a => a.split(' ')[0]);
        console.table(this.mcAnswers);
      } else {    // full mc or daily quiz mc.
        this.mcAnswers = this.gameDataSvc.getMultipleChoiceAnswers();
      }
    }
  }

  async handleSubmit() {
    this.guess = this.guess.trim();
    this.guessIsCorrect = this.isGuessCorrect();
  }

  async dismiss() {
    await this.modalCtrl.dismiss(null, 'confirm');

    if (this.isGuessCorrect()) {
      this.gameDataSvc.incrScore();
    }
    if (!this.gameDataSvc.isEndOfQuiz()) {
      this.gameDataSvc.goToNextPerson();
      this.guessIsCorrect = false;
      this.guess = '';
      if (this.useMCQuestions()) {
        // load up some new random answers;
        if (this.gameDataSvc.getGameMode() === GameMode.firstNameMultipleChoice) {
          this.mcAnswers = this.gameDataSvc.getMultipleChoiceAnswers().map(a => a.split(' ')[0]);
          console.table(this.mcAnswers);
        } else {    // full mc or daily quiz mc.
          this.mcAnswers = this.gameDataSvc.getMultipleChoiceAnswers();
        }
        // Clear the choice in the radio group.
        this.radioGroup.value = '';
      }
    } else {
      this.router.navigateByUrl('summary');
    }
  }

  async showHint() {
    const toast = await this.toastCtrlr.create({
      message: this.gameDataSvc.getHint(),
      duration: 2000,
    });
    toast.present();
  }

  public getPerson() {
    return this.gameDataSvc.getPerson();
  }

  public choiceSelected(event: any) {
    this.guess = event.detail.value;
  }

  public imageLoaded() {
  }

  public useMCQuestions(): boolean {
    return this.gameDataSvc.useMCQuestions();
  }

  public getTextPlaceHolder(): string {
    switch (this.gameDataSvc.getGameMode()) {
      case GameMode.firstNameMultipleChoice:
      case GameMode.multipleChoice:
        return 'Not used';
      case GameMode.lastNameOnly:
        return 'Enter last name';
      case GameMode.firstNameOnly:
        return 'Enter first name';
      case GameMode.fullName:
        return 'Enter full name';
      default:
        return 'unknown';
    }
  }

  public isGuessCorrect(): boolean {
    return this.gameDataSvc.isGuessCorrect(this.guess);
  }

}
