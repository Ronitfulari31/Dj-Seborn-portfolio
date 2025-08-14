import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-tour',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.scss']
})
export class TourComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const projectsContainer = document.querySelector('.projects-container') as HTMLElement | null;
    const backgroundImage = document.getElementById('background-image') as HTMLImageElement | null;
    const backgroundVideo = document.getElementById('background-video') as HTMLVideoElement | null;

    if (projectsContainer && backgroundImage && backgroundVideo) {
      this.initialAnimation();
      this.preloadImages();
      this.setupHoverEvents(backgroundImage, backgroundVideo, projectsContainer);
      // Optional: trapInnerScroll(projectsContainer);
    }
  }

  private initialAnimation() {
    const items = document.querySelectorAll('.project-item');
    items.forEach((elem, idx) => {
      const item = elem as HTMLElement;
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      setTimeout(() => {
        item.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, idx * 60);
    });
  }

  /**
   * Image/video zoom logic
   */
  private setupHoverEvents(
    bgImg: HTMLImageElement,
    bgVideo: HTMLVideoElement,
    container: HTMLElement
  ) {
    const items = container.querySelectorAll('.project-item');
    items.forEach(item => {
      const el = item as HTMLElement;
      el.addEventListener('mouseenter', () => {
        const imgUrl = el.dataset['image'];
        const videoUrl = el.dataset['video'];

        // Hide both first
        bgImg.style.opacity = '0';
        bgVideo.style.opacity = '0';

        if (imgUrl) {
          // Show image zoom
          bgImg.src = imgUrl;
          bgImg.style.transition = 'none';
          bgImg.style.transform = 'scale(1.2)';
          bgImg.style.opacity = '1';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              bgImg.style.transition =
                'transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)';
              bgImg.style.transform = 'scale(1.0)';
            });
          });
        } else if (videoUrl) {
          // Show video zoom
          const videoSource = bgVideo.querySelector('source');
          if (videoSource) {
            // To support dynamic video switch on hover
            videoSource.setAttribute('src', videoUrl);
            bgVideo.load();
            bgVideo.play();
          }
          bgVideo.style.transition = 'none';
          bgVideo.style.transform = 'scale(1.2)';
          bgVideo.style.opacity = '1';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              bgVideo.style.transition =
                'transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)';
              bgVideo.style.transform = 'scale(1.0)';
            });
          });
        }
      });

      el.addEventListener('mouseleave', () => {
        bgImg.style.opacity = '0';
        bgVideo.style.opacity = '0';
        // Optional: pause video
        bgVideo.pause();
      });
    });
  }

  /**
   * Preload images for instant display
   */
  private preloadImages() {
    const items = document.querySelectorAll('.project-item');
    items.forEach(elem => {
      const url = (elem as HTMLElement).dataset['image'];
      if (url) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
      }
    });
  }
}
