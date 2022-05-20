import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChooseModePageRoutingModule } from './choose-mode-routing.module';

import { ChooseModePage } from './choose-mode.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChooseModePageRoutingModule
  ],
  declarations: [ChooseModePage]
})
export class ChooseModePageModule {}
