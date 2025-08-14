// src/app/animation/preloader/preloader.component.ts
import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  AfterViewInit,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

// ─── GSAP ───────────────────────────────────────────────────────────────────────
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';

// Register plugins once
gsap.registerPlugin(CustomEase, Flip);

// Register custom eases
CustomEase.create('customEase', '0.6, 0.01, 0.05, 1');
CustomEase.create('directionalEase', '0.16, 1, 0.3, 1');
CustomEase.create('smoothBlur', '0.25, 0.1, 0.25, 1');
CustomEase.create('gentleIn', '0.38, 0.005, 0.215, 1');

interface GridPositions {
  firstColumnLeft: number;
  lastColumnRight: number;
  column7Left: number;
  padding: number;
}

@Component({
  selector: 'app-preloader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreloaderComponent implements AfterViewInit {
  @Output() animationDone = new EventEmitter<void>();

  dots = Array(4);
  gridCols = Array(12);
  images = [
    'https://cdn.cosmos.so/5f8d5539-943c-4df5-bae8-8e714633ddd0.jpeg',
    'https://cdn.cosmos.so/0098a074-f8a5-4821-bcb0-433c093ae255.jpeg',
    'https://cdn.cosmos.so/ce9f9fd7-a2a5-476d-9757-481ca01b5861.jpeg',
    'https://cdn.cosmos.so/94579ea4-daee-43f9-b778-84156b731361.jpeg'
  ];

  private readonly INITIAL_ZOOM = 1.2;
  private mainTl!: gsap.core.Timeline;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      gsap.config({ force3D: true });
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // small delay ensures DOM is painted
    setTimeout(() => this.initAnimation(), 100);
    window.addEventListener('resize', () => this.handleResize());
  }

  restart(): void {
    if (this.isBrowser) {
      this.initAnimation();
    }
  }

  private getGridPositions(): GridPositions | null {
  const gridOverlay = document.querySelector<HTMLElement>('.grid-overlay-inner');
  if (!gridOverlay) return null;

  const columns = gridOverlay.querySelectorAll<HTMLElement>('.grid-column');
  gsap.set('.grid-overlay', { opacity: 1 });

  // Get an array of DOMRect objects
  const columnPositions: DOMRect[] = Array.from(columns, col => col.getBoundingClientRect());
  gsap.set('.grid-overlay', { opacity: 0 });

  return {
    firstColumnLeft: columnPositions[0]?.left ?? 0,
    lastColumnRight: columnPositions[columnPositions.length - 1]?.right ?? 0,
    column7Left: columnPositions[6]?.left ?? 0,   // ✅ index into array for 7th column
    padding: parseInt(getComputedStyle(gridOverlay).paddingLeft, 10)
  };
}



  private positionTextElements() {
    const container = document.querySelector<HTMLElement>('.preloader-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const ve = document.querySelector<HTMLElement>('#text-ve');
    const la = document.querySelector<HTMLElement>('#text-la');

    if (ve) gsap.set(ve, { left: rect.left - 80 + 'px' });
    if (la) gsap.set(la, { left: rect.right + 20 + 'px' });
  }

  private alignHeaderToGrid(gridPos: ReturnType<typeof this.getGridPositions>) {
    if (!gridPos) return;

    const left = document.querySelector<HTMLElement>('.header-left');
    const mid = document.querySelector<HTMLElement>('.header-middle');
    const right = document.querySelector<HTMLElement>('.header-right');

    if (left) gsap.set(left, { position: 'absolute', left: gridPos.firstColumnLeft + 'px' });
    if (mid) gsap.set(mid, { position: 'absolute', left: gridPos.column7Left + 'px' });
    if (right) gsap.set(right, {
      position: 'absolute',
      right: window.innerWidth - gridPos.lastColumnRight + 'px'
    });
  }

  private resetToInitialState() {
    gsap.set('.preloader-container', { width: '400px', height: '300px', overflow: 'hidden' });
    gsap.set('.text-element', { fontSize: '5rem', top: '50%', transform: 'translateY(-50%)' });
    gsap.set('.big-title', { opacity: 0 });
    gsap.set('.title-line span', { y: '100%' });
    gsap.set('.grid-overlay', { opacity: 0 });
    gsap.set('.grid-column', { borderLeftColor: 'rgba(255,255,255,0)', borderRightColor: 'rgba(255,255,255,0)' });
    gsap.set('.header-left, .header-middle, .social-links', { opacity: 0, y: -20 });
    gsap.set('.footer', { y: '100%' });

    const wrappers = document.querySelectorAll<HTMLElement>('.image-wrapper');
    const imgs = document.querySelectorAll<HTMLImageElement>('.image-wrapper img');
    gsap.set(wrappers, {
      visibility: 'visible',
      clipPath: 'inset(100% 0 0 0)',
      position: 'absolute',
      top: 0, left: 0, width: '100%', height: '100%', xPercent: 0, yPercent: 0,
      clearProps: 'transform,transformOrigin'
    });
    gsap.set(imgs, { scale: this.INITIAL_ZOOM, transformOrigin: 'center center', clearProps: 'width,height' });

    this.positionTextElements();
  }

  private initAnimation(): void {
    if (!this.isBrowser) return;
    if (this.mainTl) this.mainTl.kill();

    this.resetToInitialState();
    gsap.set('.restart-btn', { opacity: 0, pointerEvents: 'none' });
    gsap.set('body', { display: 'flex', justifyContent: 'center', alignItems: 'center' });

    const wrappers = document.querySelectorAll<HTMLElement>('.image-wrapper');
    const finalWrap = document.querySelector<HTMLElement>('#final-image');
    const finalImg = finalWrap?.querySelector<HTMLImageElement>('img');
    const ve = document.querySelector<HTMLElement>('#text-ve');
    const la = document.querySelector<HTMLElement>('#text-la');
    const titleLines = document.querySelectorAll<HTMLElement>('.title-line span');

    this.mainTl = gsap.timeline({
      onComplete: () => {
        this.animationDone.emit();
      }
    });

    wrappers.forEach((w, i) => {
      if (i > 0) this.mainTl.add(`img${i}`, '<0.15');
      this.mainTl.to(w, { clipPath: 'inset(0 0 0 0)', duration: 0.65, ease: 'smoothBlur' }, i ? `img${i}` : 0);
    });

    this.mainTl.add('zoom', '>0.2').add(() => {
      if (finalWrap && finalImg) {
        const state = Flip.getState(finalWrap);
        gsap.set('.preloader-container', { overflow: 'visible' });
        gsap.set(finalWrap, { position: 'fixed', top: '50%', left: '50%', xPercent: -50, yPercent: -50, width: '100dvw', height: '100dvh' });
        Flip.from(state, { duration: 1.2, ease: 'customEase', absolute: true });
        gsap.to(finalImg, { scale: 1, duration: 1.2, ease: 'customEase' });
      }
    }, 'zoom');

    const gridPos = this.getGridPositions();
    if (gridPos) this.alignHeaderToGrid(gridPos);

    if (ve && gridPos) {
      this.mainTl.to(ve, { left: gridPos.padding + 'px', fontSize: '3rem', duration: 1.2, ease: 'directionalEase' }, 'zoom');
    }

    if (la) {
      const laState = Flip.getState(la);
      this.mainTl.add(() => {
        if (gridPos) {
          gsap.set(la, { left: 'auto', right: gridPos.padding + 'px', fontSize: '3rem' });
          Flip.from(laState, { duration: 1.2, ease: 'directionalEase', absolute: true });
        }
      }, 'zoom');
    }

    this.mainTl.add('grid', '>-0.3')
      .to('.grid-overlay', { opacity: 1, duration: 0.4, ease: 'gentleIn' }, 'grid')
      .to('.grid-column', { borderLeftColor: 'rgba(255,255,255,0.2)', borderRightColor: 'rgba(255,255,255,0.2)', duration: 0.6, stagger: 0.08, ease: 'gentleIn' }, 'grid')
      .add('header', '>-0.2')
      .to('.header-left', { opacity: 1, y: 0, duration: 0.6, ease: 'directionalEase' }, 'header')
      .to('.header-middle', { opacity: 1, y: 0, duration: 0.6, ease: 'directionalEase', delay: 0.15 }, 'header')
      .to('.social-links', { opacity: 1, y: 0, duration: 0.6, ease: 'directionalEase', delay: 0.3 }, 'header')
      .to('.footer', { y: 0, duration: 0.7, ease: 'directionalEase' }, 'header+=0.4')
      .add('title', '>-0.2')
      .to('.big-title', { opacity: 1, duration: 0.3 }, 'title')
      .to(titleLines, { y: '0%', duration: 0.9, stagger: 0.15, ease: 'customEase' }, 'title+=0.1');
  }

  private handleResize(): void {
    if (!this.isBrowser || !this.mainTl || this.mainTl.progress() !== 0) return;
    this.positionTextElements();
    const gridPos = this.getGridPositions();
    if (gridPos) this.alignHeaderToGrid(gridPos);
  }
}
