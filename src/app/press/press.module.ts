import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PressRoutingModule } from './press-routing.module';
import { PressListComponent } from './press-list/press-list.component';
import { PressDetailComponent } from './press-detail/press-detail.component';


@NgModule({
  imports: [
    CommonModule,
    PressRoutingModule,
    PressListComponent,
    PressDetailComponent
  ]
})
export class PressModule { }
