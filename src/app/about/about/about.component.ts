import { Component, AfterViewInit, ElementRef, ViewChild, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initSequentialLetterAnimation } from '../../animation/letterAnimation';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements AfterViewInit {
  @ViewChild('aboutHeading', { static: true }) heading!: ElementRef<HTMLElement>;
  @ViewChild('aboutContent', { static: true }) contentContainer!: ElementRef<HTMLElement>;
  @ViewChild('imageSwitcher', { static: true }) imageSwitcher!: ElementRef<HTMLElement>;

  private isDragging = false;
  private containerRect!: DOMRect;

  constructor(private renderer: Renderer2, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize text animation only in the browser
      const paragraphs = Array.from(
        this.contentContainer.nativeElement.querySelectorAll('p')
      ) as HTMLElement[];
      initSequentialLetterAnimation([this.heading.nativeElement, ...paragraphs]);

      // Setup cursor draggable image light/dark switcher
      if (this.imageSwitcher) {
        const container = this.imageSwitcher.nativeElement;
        const lightLogo = container.querySelector('.light-logo') as HTMLElement;

        if (!lightLogo) return;

        this.containerRect = container.getBoundingClientRect();
        let clipPercent = 50; // initial clip 50%

        // Update clip based on pointer position relative to container left
        const updateClipByX = (x: number) => {
          let percent = ((x - this.containerRect.left) / this.containerRect.width) * 100;
          percent = Math.min(100, Math.max(0, percent));
          clipPercent = percent;
          lightLogo.style.clipPath = `inset(0 ${100 - clipPercent}% 0 0)`;
        };

        const onPointerDown = (event: PointerEvent) => {
          event.preventDefault();
          this.isDragging = true;
          container.setPointerCapture(event.pointerId);
          updateClipByX(event.clientX);
          this.renderer.addClass(container, 'active');
        };

        const onPointerMove = (event: PointerEvent) => {
          if (!this.isDragging) return;
          updateClipByX(event.clientX);
        };

        const onPointerUpOrCancel = (event: PointerEvent) => {
          this.isDragging = false;
          container.releasePointerCapture(event.pointerId);
          this.renderer.removeClass(container, 'active');
        };

        container.addEventListener('pointerdown', onPointerDown);
        container.addEventListener('pointermove', onPointerMove);
        container.addEventListener('pointerup', onPointerUpOrCancel);
        container.addEventListener('pointercancel', onPointerUpOrCancel);

        // Optional: update containerRect on window resize for accuracy
        window.addEventListener('resize', () => {
          this.containerRect = container.getBoundingClientRect();
        });
      }
    }
  }
}
