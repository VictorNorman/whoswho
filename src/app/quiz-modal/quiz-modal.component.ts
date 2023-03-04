import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GameDataService } from '../services/game-data.service';

@Component({
  selector: 'app-quiz-modal',
  templateUrl: './quiz-modal.component.html',
  styleUrls: ['./quiz-modal.component.scss'],
})
export class QuizModalComponent implements OnInit {
  @Input() guessCorrect = false;
  @Input() correctAnswer = '';

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() { }

  dismiss() {
    this.modalCtrl.dismiss();
  }

}
