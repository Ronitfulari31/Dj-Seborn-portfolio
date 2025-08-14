import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home/home.component';
import { PreloaderComponent } from '../animation/preloader/preloader.component'; // adjust path

@NgModule({
  
  imports: [
    CommonModule,
    HomeRoutingModule,
    HomeComponent,
    PreloaderComponent 
  ]
})
export class HomeModule { }
