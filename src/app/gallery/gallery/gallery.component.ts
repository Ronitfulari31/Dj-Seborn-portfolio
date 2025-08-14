import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  OnDestroy,
  Renderer2,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';
import SplitType from 'split-type';

gsap.registerPlugin(CustomEase);
CustomEase.create('hop', '0.9, 0, 0.1, 1');

@Component({
  selector: 'app-gallery',
  standalone: true,
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true })
  containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLDivElement>;
  @ViewChild('overlay', { static: true })
  overlayRef!: ElementRef<HTMLDivElement>;
  @ViewChild('projectTitle', { static: true })
  projectTitleRef!: ElementRef<HTMLParagraphElement>;

  // Data arrays for items
  items = [
    'DJ',
    'Solar Bloom',
    'Neon Handscape',
    'Echo Discs',
    'Void Gaze',
    'Gravity Sync',
    'Heat Core',
    'Fractal Mirage',
    'Nova Pulse',
    'Sonic Horizon',
    'Dream Circuit',
    'Lunar Mesh',
    'Radiant Dusk',
    'Pixel Drift',
    'Vortex Bloom',
    'Shadow Static',
    'Crimson Phase',
    'Retro Cascade',
    'Photon Fold',
    'Zenith Flow',
  ];

  imageUrls = [
    'assets/images/GoaBG.jpg',
    'assets/images/PuneBG.jpg',
    'https://cdn.cosmos.so/2f49a117-05e7-4ae9-9e95-b9917f970adb?format=jpeg',
    'https://cdn.cosmos.so/7b5340f5-b4dc-4c08-8495-c507fa81480b?format=jpeg',
    'https://cdn.cosmos.so/f733585a-081e-48e7-a30e-e636446f2168?format=jpeg',
    'https://cdn.cosmos.so/47caf8a0-f456-41c5-98ea-6d0476315731?format=jpeg',
    'https://cdn.cosmos.so/f99f8445-6a19-4a9a-9de3-ac382acc1a3f?format=jpeg',
  ];

  // Video URLs parallel to imageUrls - empty string means no video for that index
  videoUrls = [
    '', // no video, show image
   'assets/images/PuneAfterMovie.mp4',
    // sample video URL (can use mp4)
    '',
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/bee.mp4',
    '',
    '',
    '',
  ];

  // DOM references
  container!: HTMLDivElement;
  canvas!: HTMLDivElement;
  overlay!: HTMLDivElement;
  projectTitle!: HTMLParagraphElement;

  settings = {
    baseWidth: 400,
    smallHeight: 330,
    largeHeight: 500,
    itemGap: 65,
    expandedScale: 0.4,
    dragEase: 0.075,
    momentumFactor: 200,
    overlayOpacity: 0.9,
    overlayEaseDuration: 0.8,
    zoomDuration: 0.6,
  };

  itemSizes = [
    { width: this.settings.baseWidth, height: this.settings.smallHeight },
    { width: this.settings.baseWidth, height: this.settings.largeHeight },
  ];

  columns = 4;

  currentX = 0;
  currentY = 0;
  targetX = 0;
  targetY = 0;

  isDragging = false;
  mouseHasMoved = false;

  visibleItems = new Set<string>();

  isExpanded = false;
  activeItem: HTMLElement | null = null;
  activeItemId: string | null = null;
  expandedItem: HTMLElement | null = null;
  titleSplit: any = null;

  animationFrameId: number | null = null;

  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit() {
    this.container = this.containerRef.nativeElement;
    this.canvas = this.canvasRef.nativeElement;
    this.overlay = this.overlayRef.nativeElement;
    this.projectTitle = this.projectTitleRef.nativeElement;

    if (isPlatformBrowser(this.platformId)) {
      this.updateVisibleItems();
      this.animate();
      this.initEvents();
    }
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  getItemSize(row: number, col: number) {
    return this.itemSizes[
      Math.abs((row * this.columns + col) % this.itemSizes.length)
    ];
  }

  getItemPosition(col: number, row: number) {
    return {
      x: col * (this.settings.baseWidth + this.settings.itemGap),
      y:
        row *
        (Math.max(this.settings.smallHeight, this.settings.largeHeight) +
          this.settings.itemGap),
    };
  }

  updateVisibleItems() {
    const buffer = 3;
    const vw = window.innerWidth * (1 + buffer);
    const vh = window.innerHeight * (1 + buffer);
    const startCol = Math.floor(
      (-this.currentX - vw / 2) /
        (this.settings.baseWidth + this.settings.itemGap)
    );
    const endCol = Math.ceil(
      (-this.currentX + vw * 1.5) /
        (this.settings.baseWidth + this.settings.itemGap)
    );
    const startRow = Math.floor(
      (-this.currentY - vh / 2) /
        (Math.max(this.settings.smallHeight, this.settings.largeHeight) +
          this.settings.itemGap)
    );
    const endRow = Math.ceil(
      (-this.currentY + vh * 1.5) /
        (Math.max(this.settings.smallHeight, this.settings.largeHeight) +
          this.settings.itemGap)
    );
    const current = new Set<string>();

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const id = `${col},${row}`;
        current.add(id);
        if (
          this.visibleItems.has(id) ||
          (this.activeItemId === id && this.isExpanded)
        )
          continue;

        const size = this.getItemSize(row, col);
        const pos = this.getItemPosition(col, row);

        const item = this.renderer.createElement('div') as HTMLElement;
        item.className = 'item';
        item.id = id;
        Object.assign(item.style, {
          width: `${size.width}px`,
          height: `${size.height}px`,
          left: `${pos.x}px`,
          top: `${pos.y}px`,
        });
        item.dataset['width'] = size.width.toString();
        item.dataset['height'] = size.height.toString();

        const num = Math.abs((row * this.columns + col) % this.items.length);

        const mediaContainer = this.renderer.createElement('div');
        mediaContainer.className = 'item-image-container';

        const videoUrl = this.videoUrls[num % this.videoUrls.length];
        if (videoUrl) {
          const video = this.renderer.createElement(
            'video'
          ) as HTMLVideoElement;
          video.src = videoUrl;
          video.autoplay = true;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          this.renderer.appendChild(mediaContainer, video);
        } else {
          const img = this.renderer.createElement('img') as HTMLImageElement;
          img.src = this.imageUrls[num % this.imageUrls.length];
          img.alt = `Image ${num + 1}`;
          this.renderer.appendChild(mediaContainer, img);
        }

        this.renderer.appendChild(item, mediaContainer);

        const cap = this.renderer.createElement('div');
        cap.className = 'item-caption';

        const name = this.renderer.createElement('div');
        name.className = 'item-name';
        name.textContent = this.items[num];
        this.renderer.appendChild(cap, name);

        const number = this.renderer.createElement('div');
        number.className = 'item-number';
        number.textContent = `#${(num + 1).toString().padStart(5, '0')}`;
        this.renderer.appendChild(cap, number);

        this.renderer.appendChild(item, cap);

        item.addEventListener('click', () => {
          if (!this.mouseHasMoved && !this.isDragging)
            this.expandItem(item, num);
        });

        this.renderer.appendChild(this.canvas, item);
        this.visibleItems.add(id);
      }
    }

    // Remove items no longer visible
    this.visibleItems.forEach((id) => {
      if (!current.has(id)) {
        const el = document.getElementById(id);
        if (el) el.remove();
        this.visibleItems.delete(id);
      }
    });
  }

  setAndAnimateTitle(title: string) {
    if (this.titleSplit) this.titleSplit.revert();
    this.projectTitle.textContent = title;
    this.titleSplit = new SplitType(this.projectTitle, { types: 'words' });
    gsap.set(this.titleSplit.words, { y: '100%' });
  }

  animateTitleIn() {
    gsap.to(this.titleSplit.words, {
      y: '0%',
      opacity: 1,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.out',
    });
  }

  animateTitleOut() {
    gsap.to(this.titleSplit.words, {
      y: '-100%',
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.in',
    });
  }

  expandItem(item: HTMLElement, index: number) {
    this.isExpanded = true;
    this.activeItem = item;
    this.activeItemId = item.id;

    const mediaElement = item.querySelector('img, video')!;
    const mediaSrc =
      mediaElement.tagName === 'VIDEO'
        ? (mediaElement as HTMLVideoElement).currentSrc ||
          (mediaElement as HTMLVideoElement).src
        : (mediaElement as HTMLImageElement).src;

    const w = parseInt(item.dataset['width']!);
    const h = parseInt(item.dataset['height']!);

    this.setAndAnimateTitle(this.items[index]);

    // Caption clone animation out
    const caption = item.querySelector('.item-caption')! as HTMLElement;
    const clone = caption.cloneNode(true) as HTMLElement;
    clone.classList.add('caption-clone');
    const rect = caption.getBoundingClientRect();
    Object.assign(clone.style, {
      left: `${rect.left}px`,
      bottom: `${window.innerHeight - rect.bottom}px`,
      width: `${rect.width}px`,
    });
    document.body.appendChild(clone);

    const nameSplit = new SplitType(
      clone.querySelector('.item-name') as HTMLElement,
      { types: 'words' }
    );
    const numberSplit = new SplitType(
      clone.querySelector('.item-number') as HTMLElement,
      { types: 'words' }
    );
    gsap.to([nameSplit.words, numberSplit.words], {
      y: '100%',
      opacity: 0,
      duration: 0.6,
      stagger: 0.03,
      ease: 'power3.in',
      onComplete: () => clone.remove(),
    });
    caption.style.opacity = '0';

    // Overlay fade in
    this.overlay.classList.add('active');
    gsap.to(this.overlay, {
      opacity: this.settings.overlayOpacity,
      duration: this.settings.overlayEaseDuration,
    });

    // Create expanded item
    this.expandedItem = document.createElement('div');
    this.expandedItem.className = 'expanded-item';
    Object.assign(this.expandedItem.style, {
      width: `${w}px`,
      height: `${h}px`,
    });

    if (mediaElement.tagName === 'VIDEO') {
      const video = document.createElement('video');
      video.src = mediaSrc;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      this.expandedItem.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = mediaSrc;
      this.expandedItem.appendChild(img);
    }

    this.expandedItem.addEventListener('click', () => this.closeExpandedItem());
    document.body.appendChild(this.expandedItem);

    // Fade out other items
    document.querySelectorAll('.item').forEach((el) => {
      if (el !== this.activeItem) {
        if (el instanceof HTMLElement) {
          gsap.to(el, {
            opacity: 0,
            duration: this.settings.overlayEaseDuration,
            ease: 'power2.inOut',
          });
        }
      }
    });

    const targetW = window.innerWidth * this.settings.expandedScale;
    const targetH = targetW * (h / w);
    gsap.delayedCall(0.5, () => this.animateTitleIn());

    gsap.fromTo(
      this.expandedItem,
      {
        x: rect.left + w / 2 - window.innerWidth / 2,
        y: rect.top + h / 2 - window.innerHeight / 2,
      },
      {
        x: 0,
        y: 0,
        width: targetW,
        height: targetH,
        duration: this.settings.zoomDuration,
        ease: 'hop',
      }
    );
  }

  closeExpandedItem() {
    if (!this.expandedItem) return;

    this.animateTitleOut();

    gsap.to(this.overlay, {
      opacity: 0,
      duration: this.settings.overlayEaseDuration,
      onComplete: () => this.overlay.classList.remove('active'),
    });

    document.querySelectorAll('.item').forEach((el) => {
      if (el.id !== this.activeItemId) {
        if (el instanceof HTMLElement)
          gsap.to(el, {
            opacity: 1,
            duration: this.settings.overlayEaseDuration,
            delay: 0.3,
          });
      }
    });

    const originalItem = document.getElementById(this.activeItemId!)!;
    const caption = originalItem.querySelector('.item-caption') as HTMLElement;

    const clone = caption.cloneNode(true) as HTMLElement;
    clone.classList.add('caption-clone');
    const rect = caption.getBoundingClientRect();
    Object.assign(clone.style, {
      left: `${rect.left}px`,
      bottom: `${window.innerHeight - rect.bottom}px`,
      width: `${rect.width}px`,
    });
    document.body.appendChild(clone);

    const nameSplit = new SplitType(
      clone.querySelector('.item-name') as HTMLElement,
      { types: 'words' }
    );
    const numberSplit = new SplitType(
      clone.querySelector('.item-number') as HTMLElement,
      { types: 'words' }
    );
    gsap.fromTo(
      [nameSplit.words, numberSplit.words],
      {
        y: '100%',
        opacity: 0,
      },
      {
        y: '0%',
        opacity: 1,
        duration: 0.7,
        stagger: 0.03,
        ease: 'power3.out',
        onComplete: () => {
          caption.style.opacity = '1';
          clone.remove();
        },
      }
    );

    const pos = originalItem.getBoundingClientRect();
    gsap.to(this.expandedItem, {
      x: pos.left + pos.width / 2 - window.innerWidth / 2,
      y: pos.top + pos.height / 2 - window.innerHeight / 2,
      width: pos.width,
      height: pos.height,
      duration: this.settings.zoomDuration,
      ease: 'hop',
      onComplete: () => {
        this.expandedItem!.remove();
        this.isExpanded = false;
      },
    });
  }

  animate() {
    this.currentX += (this.targetX - this.currentX) * this.settings.dragEase;
    this.currentY += (this.targetY - this.currentY) * this.settings.dragEase;
    this.canvas.style.transform = `translate(${this.currentX}px,${this.currentY}px)`;
    requestAnimationFrame(() => this.animate());
  }

  initEvents() {
    this.container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.mouseHasMoved = false;
      this.startX = e.clientX;
      this.startY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) this.mouseHasMoved = true;
      this.targetX += dx;
      this.targetY += dy;
      this.startX = e.clientX;
      this.startY = e.clientY;
    });

    window.addEventListener('mouseup', () => (this.isDragging = false));

    this.overlay.addEventListener('click', () => this.closeExpandedItem());
  }

  private startX = 0;
  private startY = 0;
}
