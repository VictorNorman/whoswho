import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChooseDifficultyPage } from './choose-difficulty.page';

const routes: Routes = [
  {
    path: '',
    component: ChooseDifficultyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChooseDifficultyPageRoutingModule {}
