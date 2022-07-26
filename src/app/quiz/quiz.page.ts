import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonRadioGroup, ModalController, ToastController } from '@ionic/angular';
import { GameDataService } from '../game-data.service';
import { QuizModalComponent } from '../quiz-modal/quiz-modal.component';

@Component({
  selector: 'app-quiz',
  templateUrl: 'quiz.page.html',
  styleUrls: ['quiz.page.scss'],
})
export class QuizPage {

  @ViewChild('radiogroup', { static: false }) radioGroup: IonRadioGroup;

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
      this.mcAnswers = this.gameDataSvc.getMultipleChoiceAnswers();
    }
  }

  async handleSubmit() {
    this.guess = this.guess.trim();
    const quizModal = await this.modalCtrl.create({
      component: QuizModalComponent,
      componentProps: {
        guessCorrect: this.isGuessCorrect(),
        correctAnswer: this.gameDataSvc.getCorrectAnswer(),
      }
    });
    await quizModal.present();

    await quizModal.onDidDismiss();

    if (this.isGuessCorrect()) {
      this.gameDataSvc.incrScore();
    }
    if (!this.gameDataSvc.isEndOfQuiz()) {
      this.gameDataSvc.goToNextPerson();
      this.guessIsCorrect = false;
      this.guess = '';
      if (this.useMCQuestions()) {
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
  }

  public useMCQuestions(): boolean {
    return this.gameDataSvc.useMCQuestions();
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

  public isGuessCorrect(): boolean {
    return this.gameDataSvc.isGuessCorrect(this.guess);
  }

}
