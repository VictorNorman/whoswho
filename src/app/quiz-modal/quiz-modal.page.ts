import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-quiz-modal',
  templateUrl: './quiz-modal.page.html',
  styleUrls: ['./quiz-modal.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class QuizModalPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
