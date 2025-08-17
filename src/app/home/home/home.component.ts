import {
  AfterViewInit,
  ApplicationRef,
  Component,
  Inject,
  OnDestroy,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import gsap from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
import { Observer } from 'gsap/Observer';
import { filter, first } from 'rxjs/operators';

gsap.registerPlugin(ScrollToPlugin, Observer);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  host: { '[attr.ngSkipHydration]': 'true' },
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private observer?: Observer;
  private animationId?: number;

  /** Morphing text vars */
  lines = [
    'DJ',
    'The Producer',
    'Remixer',
    'Bollywood-Tech Pioneer',
    'Based in Pune, India',
  ];
  private morphTime = 1.2;
  private cooldownTime = 0.3;
  private morph = 0;
  private cooldown = this.cooldownTime;
  private textIndex = 0; // start from first item

  constructor(
    private router: Router,
    private appRef: ApplicationRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Morphing text effect
    this.appRef.isStable
      .pipe(
        filter((stable) => stable),
        first()
      )
      .subscribe(() => {
        this.initMorphingText();
      });
  }

  private initMorphingText() {
    const text1El = document.getElementById('text1');
    const text2El = document.getElementById('text2');

    if (!text1El || !text2El) return;

    // Initialize text content
    text1El.textContent = this.lines[this.textIndex % this.lines.length];
    text2El.textContent = this.lines[(this.textIndex + 1) % this.lines.length];
    text1El.style.opacity = '1';
    text2El.style.opacity = '0.5';

    let morph = 0;
    let cooldown = this.cooldownTime;

    const setMorph = (fraction: number) => {
      // Keep at least 0.25 opacity so text is never gone
      const o2 = Math.max(Math.pow(fraction, 0.4), 0.25);
      const o1 = Math.max(Math.pow(1 - fraction, 0.4), 0.25);

      text2El.style.filter = `blur(${Math.min(8 / Math.max(fraction, 0.01) - 8, 100)}px)`;
      text2El.style.opacity = `${o2}`;

      text1El.style.filter = `blur(${Math.min(8 / Math.max(1 - fraction, 0.01) - 8, 100)}px)`;
      text1El.style.opacity = `${o1}`;

      text1El.textContent = this.lines[this.textIndex % this.lines.length];
      text2El.textContent = this.lines[(this.textIndex + 1) % this.lines.length];
    };

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      const dt = 1 / 60;
      cooldown -= dt;

      if (cooldown <= 0) {
        morph += dt;
        if (morph > this.morphTime) {
          morph = 0;
          cooldown = this.cooldownTime;
          this.textIndex = (this.textIndex + 1) % this.lines.length;
        }
        setMorph(morph / this.morphTime);
      }
    };

    animate();
  }

  ngOnDestroy() {
    this.observer?.kill();
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  /** Scroll to Contact section */
  scrollToContact() {
    const contactRoute = '/contact';
    if (this.router.url === contactRoute) {
      gsap.to(window, {
        scrollTo: { y: '#contact', offsetY: 72 },
        duration: 1,
        ease: 'power2.out',
      });
    } else {
      this.router.navigate([contactRoute]).then(() =>
        setTimeout(() => {
          gsap.to(window, {
            scrollTo: { y: '#contact', offsetY: 72 },
            duration: 1,
            ease: 'power2.out',
          });
        }, 150)
      );
    }
  }
}
