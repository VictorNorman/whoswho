import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { GameDataService } from '../game-data.service';

interface PossibleAnswersNames {
  name: string;
}
@Component({
  selector: 'app-quiz',
  templateUrl: 'quiz.page.html',
  styleUrls: ['quiz.page.scss'],
})
export class QuizPage {

  public names: PossibleAnswersNames[] = [
    { name: 'Susan Norman' },
    { name: 'James Norman' },
    { name: 'Victor Norman' },
  ];
  public guess = '';   // the user's guess of who this is.
  public guessIsCorrect = false;

  constructor(public toastCtrlr: ToastController,
    public gameDataSvc: GameDataService,
    private router: Router) { }

  async showHint() {
    const toast = await this.toastCtrlr.create({
      message: 'This is your hint!',
      duration: 2000,
    });
    toast.present();
  }

  async onSubmit() {
    this.guessIsCorrect = this.guess === 'Victor Norman';
    const toast = await this.toastCtrlr.create({
      message: this.guessIsCorrect ? `Correct! This is ${this.guess}` : 'Sorry, that is not correct.',
      duration: 2000,
    });
    toast.present();
    if (!this.gameDataSvc.isEndOfQuiz()) {
      this.gameDataSvc.goToNextPerson();
      this.guessIsCorrect = false;
      this.guess = '';
    } else {
      this.router.navigateByUrl('summary');
    }
  }

}
