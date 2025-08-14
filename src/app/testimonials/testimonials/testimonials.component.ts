import {
  Component,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef,
  ViewChild,
  Renderer2,
  OnDestroy
} from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [NgFor],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss']
})
export class TestimonialsComponent implements AfterViewInit, OnDestroy {
  testimonials = [
    {
      text: 'DJ SEABORN knows how to start a party and keep it going all night!',
      name: 'Event Organizer, Pune',
      designation: 'Event Organizer',
      image: 'assets/images/BlackOutBG.jpg'
    },
    {
      text: 'Unmatched energy behind the decks—his Bollywood-Electro sets are perfection every time.',
      name: 'Club Manager, Goa',
      designation: 'Club Manager',
      image: 'assets/images/BlackOutBG.jpg'
    },
    {
      text: 'A crowd favorite for weddings and festivals. Professional, passionate, and always brings the best vibe!',
      name: 'Private Client, Jim Corbett',
      designation: 'Private Client',
      image: 'assets/images/BlackOutBG.jpg'
    },
     {
      text: 'A crowd favorite for weddings and festivals. Professional, passionate, and always brings the best vibe!',
      name: 'Private Client, Jim Corbett',
      designation: 'Private Client',
      image: 'assets/images/BlackOutBG.jpg'
    },
     {
      text: 'A crowd favorite for weddings and festivals. Professional, passionate, and always brings the best vibe!',
      name: 'Private Client, Jim Corbett',
      designation: 'Private Client',
      image: 'assets/images/BlackOutBG.jpg'
    },
  ];

  currentIndex = 0;
  cardsPerSlide = 3;

  @ViewChildren('cardElem', { read: ElementRef }) cardElems!: QueryList<ElementRef>;
  @ViewChild('carouselTrack', { static: true }) carouselTrack!: ElementRef<HTMLElement>;
  private resizeListener?: () => void;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    setTimeout(() => this.centerCarousel());
    this.resizeListener = this.renderer.listen('window', 'resize', () => this.centerCarousel());
  }

  ngOnDestroy() {
    if (this.resizeListener) this.resizeListener();
  }

  prevCard() {
    if (this.currentIndex > 0) {
      this.navigateTo(this.currentIndex - this.cardsPerSlide);
    }
  }

  nextCard() {
    const maxIndex = Math.max(0, this.testimonials.length - this.cardsPerSlide);
    if (this.currentIndex < maxIndex) {
      this.navigateTo(this.currentIndex + this.cardsPerSlide);
    }
  }

  navigateTo(index: number) {
    const maxIndex = Math.max(0, this.testimonials.length - this.cardsPerSlide);
    this.currentIndex = Math.max(0, Math.min(index, maxIndex));
    this.centerCarousel();
  }

  centerCarousel() {
    if (!this.cardElems.length || !this.carouselTrack) return;
    const card = this.cardElems.first.nativeElement;
    const cardWidth = card.offsetWidth;
    const gap = 20;
    const moveDistance = cardWidth + gap;
    const translateX = -(this.currentIndex * moveDistance);
    this.renderer.setStyle(
      this.carouselTrack.nativeElement,
      'transform',
      `translateX(${translateX}px)`
    );
  }

  // Hover tilt effect
  handleCardMouseMove(event: MouseEvent, i: number) {
    const cardRef = this.cardElems.get(i)?.nativeElement;
    if (!cardRef) return;

    const rect = cardRef.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const xDeg = (y - 0.5) * 8;
    const yDeg = (x - 0.5) * -8;
    cardRef.style.transform =
      `perspective(1200px) rotateX(${xDeg}deg) rotateY(${yDeg}deg) scale(1.05)`;
  }

  handleCardMouseLeave(i: number) {
    const cardRef = this.cardElems.get(i)?.nativeElement;
    if (!cardRef) return;
    cardRef.style.transform = '';
  }

  get testimonialSlides() {
    return Array(Math.ceil(this.testimonials.length / this.cardsPerSlide));
  }
}
