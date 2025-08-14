import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TourRoutingModule } from './tour-routing.module';
import { TourComponent } from './tour/tour.component';


@NgModule({
  imports: [
    CommonModule,
    TourRoutingModule,
    TourComponent
  ]
})
export class TourModule { }
