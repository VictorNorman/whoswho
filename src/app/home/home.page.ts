import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { GameDataService } from '../game-data.service';

interface PossibleAnswersNames {
  name: string;
}
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public names: PossibleAnswersNames[] = [
    { name: 'Susan Norman' },
    { name: 'James Norman' },
    { name: 'Victor Norman' },
  ];
  public guess = '';   // the user's guess of who this is.
  public guessIsCorrect = false;

  constructor(public toastCtrlr: ToastController,
    public gameDataSvc: GameDataService) { }

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
  }

}
