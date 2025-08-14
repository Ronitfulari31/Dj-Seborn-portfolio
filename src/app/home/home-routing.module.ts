import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreloaderComponent } from '../animation/preloader/preloader.component'; // adjust path
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: PreloaderComponent, // Show preloader first
  },
  {
    path: 'content', // Your actual home content
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
