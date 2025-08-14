import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PressListComponent } from './press-list/press-list.component';
import { PressDetailComponent } from './press-detail/press-detail.component';

const routes: Routes = [
  { path: '', component: PressListComponent },
  { path: ':id', component: PressDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PressRoutingModule { }
