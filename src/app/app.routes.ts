import { Routes } from '@angular/router';

// export const routes: Routes = [
//   {
//     path: '',
//     loadChildren: () =>
//       import('./home/home.module').then(m => m.HomeModule)
//   },
//   {
//     path: 'about',
//     loadChildren: () =>
//       import('./about/about.module').then(m => m.AboutModule)
//   },
//   {
//     path: 'gallery',
//     loadChildren: () =>
//       import('./gallery/gallery.module').then(m => m.GalleryModule)
//   },
//   {
//     path: 'tour',
//     loadChildren: () =>
//       import('./tour/tour.module').then(m => m.TourModule)
//   },
//   {
//     path: 'testimonials',
//     loadChildren: () =>
//       import('./testimonials/testimonials.module').then(m => m.TestimonialsModule)
//   },
//   {
//     path: 'press',
//     loadChildren: () =>
//       import('./press/press.module').then(m => m.PressModule)
//   },
//   {
//     path: 'contact',
//     loadChildren: () =>
//       import('./contact/contact.module').then(m => m.ContactModule)
//   },
//   { path: '**', redirectTo: '' }
// ];

//

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./animation/preloader/preloader.component').then(m => m.PreloaderComponent)
      },
      {    path: 'home',
    loadComponent: () => 
      import('./home/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadChildren: () =>
      import('./about/about.module').then(m => m.AboutModule)
  },
  {
    path: 'gallery',
    loadChildren: () =>
      import('./gallery/gallery.module').then(m => m.GalleryModule)
  },
  {
    path: 'tour',
    loadChildren: () =>
      import('./tour/tour.module').then(m => m.TourModule)
  },
  {
    path: 'testimonials',
    loadChildren: () =>
      import('./testimonials/testimonials.module').then(m => m.TestimonialsModule)
  },
  {
    path: 'press',
    loadChildren: () =>
      import('./press/press.module').then(m => m.PressModule)
  },
  {
    path: 'contact',
    loadChildren: () =>
      import('./contact/contact.module').then(m => m.ContactModule)
  },
  { path: '**', redirectTo: '' }
];
