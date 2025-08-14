import { RouterOutlet } from '@angular/router';
// src/app/app.component.ts
import { Component } from '@angular/core';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { HomeComponent } from './home/home/home.component';
import { AboutComponent } from './about/about/about.component';

import { TourComponent } from './tour/tour/tour.component';
import { TestimonialsComponent } from './testimonials/testimonials/testimonials.component';
import { PressListComponent } from './press/press-list/press-list.component';
import { PressDetailComponent } from './press/press-detail/press-detail.component';
import { ContactComponent } from './contact/contact/contact.component';
import { GestureObserverComponent } from './animation/gesture-observer.component';
import { PreloaderComponent } from './animation/preloader/preloader.component';
import { NgIf } from '@angular/common';
import { GalleryComponent } from './gallery/gallery/gallery.component';
//import { PressListComponent } from './press/press-list/press-list.component';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    HomeComponent,
    ContactComponent,
    PressListComponent,
    TestimonialsComponent,
    TourComponent,
    AboutComponent,
    PressDetailComponent,
    GestureObserverComponent,
    FooterComponent,
    GalleryComponent
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  showPreloader = true;

  onPreloaderDone() {
    this.showPreloader = false;
  }
}
