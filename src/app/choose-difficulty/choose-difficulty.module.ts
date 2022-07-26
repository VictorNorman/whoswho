import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChooseDifficultyPageRoutingModule } from './choose-difficulty-routing.module';

import { ChooseDifficultyPage } from './choose-difficulty.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChooseDifficultyPageRoutingModule
  ],
  declarations: [ChooseDifficultyPage]
})
export class ChooseDifficultyPageModule {}
