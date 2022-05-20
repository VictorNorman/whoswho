import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChooseModePage } from './choose-mode.page';

const routes: Routes = [
  {
    path: '',
    component: ChooseModePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChooseModePageRoutingModule {}
