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
import { ScrollAnimationHelper } from './../../animation/scrollAnimation';
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

  /** GSAP text animation vars **/
  lines = [
    'DJ',
    'The Producer',
    'Remixer',
    'Bollywood-Tech Pioneer',
    'Based in Pune, India',
  ];
  splitLines: string[] = [];
  currentIndex = 0;
  private animationRanKey = 'home-animation-ran';

  /** Morphing text vars **/
  private morphTime = 1;
  private cooldownTime = 0.25;
  private morph = 0;
  private cooldown = this.cooldownTime;
  private texts = [...this.lines]; // morphing animation uses same text lines
  private textIndex = this.texts.length - 1;
  private time = new Date();

  constructor(
    private scrollAnimation: ScrollAnimationHelper,
    private router: Router,
    private appRef: ApplicationRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Prepare split lines for GSAP line animation
    this.splitLines = this.lines.map((line) =>
      line
        .split('')
        .map((char) => `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`)
        .join('')
    );
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Initialize GSAP scroll animations immediately
    this.scrollAnimation.initScrollAnimations();
    this.scrollAnimation.initStaggeredAnimations();

    // Create scrolling Observer
    this.observer = Observer.create({
      target: window,
      type: 'wheel,touch',
      tolerance: 10,
      preventDefault: false,
      onDown: () => this.animateNextLine(),
      onUp: () => this.animatePreviousLine(),
    });

    // Animate all lines once per session
    if (!sessionStorage.getItem(this.animationRanKey)) {
      this.animateAllLines();
      sessionStorage.setItem(this.animationRanKey, 'true');
    }

    // Defer starting morphing animation until app is stable in browser
    this.appRef.isStable
      .pipe(
        filter((stable) => stable),
        first()
      )
      .subscribe(() => {
        this.initMorphingText();
      });
  }

  /** Morphing text setup **/
  private initMorphingText() {
    const text1El = document.getElementById('text1');
    const text2El = document.getElementById('text2');
    if (text1El && text2El) {
    text1El.textContent = "It Works!";
    text1El.style.opacity = "1";
    text2El.textContent = "Second text";
    text2El.style.opacity = "1";
  }
    
    if (!text1El || !text2El) return;

    text1El.textContent = this.texts[this.textIndex % this.texts.length];
    text2El.textContent = this.texts[(this.textIndex + 1) % this.texts.length];
    console.log('text1',text1El);
    console.log('text1',text2El);

    const setMorph = (fraction: number) => {
      text2El.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      text2El.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      fraction = 1 - fraction;
      text1El.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      text1El.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      text1El.textContent = this.texts[this.textIndex % this.texts.length];
      text2El.textContent = this.texts[(this.textIndex + 1) % this.texts.length];
    };

    const doMorph = () => {
      this.morph -= this.cooldown;
      this.cooldown = 0;
      let fraction = this.morph / this.morphTime;
      if (fraction > 1) {
        this.cooldown = this.cooldownTime;
        fraction = 1;
      }
      setMorph(fraction);
    };

    const doCooldown = () => {
      this.morph = 0;
      text2El.style.filter = '';
      text2El.style.opacity = '100%';
      text1El.style.filter = '';
      text1El.style.opacity = '0%';
    };

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      const newTime = new Date();
      const shouldIncrementIndex = this.cooldown > 0;
      const dt = (newTime.getTime() - this.time.getTime()) / 1000;
      this.time = newTime;

      this.cooldown -= dt;
      if (this.cooldown <= 0) {
        if (shouldIncrementIndex) this.textIndex++;
        doMorph();
      } else {
        doCooldown();
      }
    };

    animate();
  }

  /** GSAP line animations **/
  private animateLine(index: number) {
    if (index < 0 || index >= this.lines.length) return;
    this.scrollAnimation.animateSplitText(`.split-li-line-${index} .char`);
  }

  private animateAllLines() {
    this.splitLines.forEach((_, i) => this.animateLine(i));
  }

  private animateNextLine() {
    if (this.currentIndex < this.lines.length - 1) {
      this.currentIndex++;
      this.animateLine(this.currentIndex);
    }
  }

  private animatePreviousLine() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.animateLine(this.currentIndex);
    }
  }

  ngOnDestroy() {
    this.observer?.kill();
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  /** Scroll to Contact section **/
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
