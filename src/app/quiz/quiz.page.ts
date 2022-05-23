import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonRadioGroup, ModalController, ToastController } from '@ionic/angular';
import { GameDataService } from '../game-data.service';

@Component({
  selector: 'app-quiz',
  templateUrl: 'quiz.page.html',
  styleUrls: ['quiz.page.scss'],
})
export class QuizPage {

  @ViewChild('radiogroup', { static: false }) radioGroup: IonRadioGroup;

  public guess = '';   // the user's guess of who this is.
  public guessIsCorrect = false;
  public mcAnswers: string[] = [];
  public imageNotLoaded = true;

  constructor(public toastCtrlr: ToastController,
    public gameDataSvc: GameDataService,
    private router: Router,
    private modalCtrl: ModalController) {
    if (gameDataSvc.getGameMode() === 'Multiple Choice') {
      this.mcAnswers = gameDataSvc.getMultipleChoiceAnswers();
    }
  }

  // Clean up previous guess if we navigate back to this page.
  ionViewWillEnter() {
    this.guess = '';
    this.guessIsCorrect = false;
  }

  dismiss() {
    // dismisses the modal which says if the answer is correct or not.
    this.modalCtrl.dismiss();
    if (!this.gameDataSvc.isEndOfQuiz()) {
      this.gameDataSvc.goToNextPerson();
      this.guessIsCorrect = false;
      this.guess = '';
      this.imageNotLoaded = true;
      if (this.gameDataSvc.getGameMode() === 'Multiple Choice') {
        // load up some new random answers;
        this.mcAnswers = this.gameDataSvc.getMultipleChoiceAnswers();
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

  public choiceSelected(event) {
    this.guess = event.detail.value;
  }

  public imageLoaded() {
    this.imageNotLoaded = false;
  }

  public getTextPlaceHolder(): string {
    switch (this.gameDataSvc.getGameMode()) {
      case 'Multiple Choice':
        return 'Not used';
      case 'Last name only':
        return 'Enter last name';
      case 'First name only':
        return 'Enter first name';
      case 'Full name required':
        return 'Enter full name';
    }
  }

  public showAnswer(): string {
    this.guessIsCorrect = this.gameDataSvc.isGuessCorrect(this.guess);
    return (this.guessIsCorrect ? 'Correct! ' : 'Sorry, that\'s wrong. ') + `This is ${ this.gameDataSvc.getCorrectAnswer()}.`;
  }
}
