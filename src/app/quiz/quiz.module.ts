import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { QuizPage } from './quiz.page';

import { QuizPageRoutingModule } from './quiz-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuizPageRoutingModule
  ],
  declarations: [QuizPage]
})
export class QuizPageModule {}
