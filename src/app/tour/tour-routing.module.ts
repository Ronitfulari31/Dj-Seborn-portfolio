import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TourComponent } from './tour/tour.component';

const routes: Routes = [
  { path: '', component: TourComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TourRoutingModule { }
