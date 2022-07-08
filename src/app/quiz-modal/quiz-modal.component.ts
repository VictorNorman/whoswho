import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GameDataService } from '../game-data.service';

@Component({
  selector: 'app-quiz-modal',
  templateUrl: './quiz-modal.component.html',
  styleUrls: ['./quiz-modal.component.scss'],
})
export class QuizModalComponent implements OnInit {
  @Input() guessCorrect: boolean;
  @Input() correctAnswer: string;

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() { }

  dismiss() {
    this.modalCtrl.dismiss();
  }

}
