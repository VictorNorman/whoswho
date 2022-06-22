import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { NgxMaterialRatingModule } from 'ngx-material-rating';
import { SummaryPageRoutingModule } from './summary-routing.module';

import { SummaryPage } from './summary.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxMaterialRatingModule,
    SummaryPageRoutingModule
  ],
  declarations: [SummaryPage]
})
export class SummaryPageModule {}
