import { Component, Inject, OnInit, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser, NgClass, NgFor, NgIf } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, RouterModule,NgIf],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isMobile = false;
  menuOpen = false;

  private sectionRouteMap: Record<string, string> = {
    home: '/',
    about: '/about',
    gallery: '/gallery',
    tour: '/tour',
    testimonials: '/testimonials',
    press: '/press-details',
    contact: '/contact',
  };

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenWidth();
      window.addEventListener('resize', () => this.checkScreenWidth());
    }
  }

  checkScreenWidth() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile && this.menuOpen) {
      this.closeMenu();
    }
  }

scrollToSection(sectionId: string) {
  if (sectionId === 'press') {
    const pressRoute = '/press';

    if (this.router.url === pressRoute) {
      // Already on /press, use GSAP to scroll to #press section
      gsap.to(window, {
        scrollTo: { y: '#press', offsetY: 72 },
        duration: 1,
        ease: 'power2.out',
      });
      this.closeMenu();
    } else {
      // Navigate first, then scroll after navigation/render
      this.router.navigate([pressRoute]).then(() => {
        setTimeout(() => {
          gsap.to(window, {
            scrollTo: { y: '#press', offsetY: 72 },
            duration: 1,
            ease: 'power2.out',
          });
          this.closeMenu();
        }, 150);
      });
    }
    return;
  }

  // Default behavior for other routes/sections
  const targetRoute = this.sectionRouteMap[sectionId];
  if (!targetRoute) {
    console.warn(`No route mapped for section '${sectionId}'.`);
    return;
  }

  if (this.router.url === targetRoute) {
    this.gsapScroll(sectionId);
    this.closeMenu();
  } else {
    this.router.navigate([targetRoute]).then(() => {
      setTimeout(() => {
        this.gsapScroll(sectionId);
        this.closeMenu();
      }, 150);
    });
  }
}


  private gsapScroll(sectionId: string) {
    gsap.to(window, {
      scrollTo: { y: `#${sectionId}`, offsetY: 72 },
      duration: 1,
      ease: 'power2.out',
    });
  }

 toggleMenu() {
  // Only allow toggle if mobile
  if (!this.isMobile) {
    return; // desktop: do nothing
  }

  this.menuOpen = !this.menuOpen;
  if (this.menuOpen) {
    gsap.to('.sidebar-menu', {
      x: 0,
      duration: 0.4,
      ease: 'power1.out',
      display: 'block',
    });
    gsap.to('.overlay', { autoAlpha: 0.5, duration: 0.4 });
  } else {
    this.closeMenu();
  }
}



closeMenu() {
  this.menuOpen = false;
  gsap.to('.sidebar-menu', {
    x: '100%',                 // Slide sidebar off to the right
    duration: 0.3,
    ease: 'power1.in',
    onComplete: () => {
      gsap.set('.sidebar-menu', { display: 'none' });
    },
  });
  gsap.to('.overlay', { autoAlpha: 0, duration: 0.3 });
}

}
