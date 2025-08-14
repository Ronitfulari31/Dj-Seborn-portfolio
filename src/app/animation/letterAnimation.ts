// src/app/animation/letterAnimation.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomEase from 'gsap/CustomEase';
import SplitText from 'gsap/SplitText';

export function initSequentialLetterAnimation(elements: HTMLElement[]) {
  gsap.registerPlugin(SplitText, CustomEase, ScrollTrigger);

  CustomEase.create('osmo-ease', '0.625, 0.05, 0, 1');

  document.fonts.ready.then(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: elements[0].closest('.about-section'),
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    });

    elements.forEach(el => {
      // For a slight animation on the whole block (fade+up)
      tl.from(el, {
        opacity: 0,
        y: 20,
        duration: 0.4,  // Fast fade up of block
        ease: 'power1.out'
      }, '+=0.1');

      // Split text into chars for letter animation
      const split = new SplitText(el, {type: 'chars', charsClass: 'letter'});

      // Animate letters with faster speed and tighter stagger
      tl.from(split.chars, {
        yPercent: 110,
        opacity: 0,
        duration: 0.6,  // faster than before
        stagger: 0.004, // tighter stagger for quicker reveal
        ease: 'osmo-ease'
      }, '<');  // '<' triggers concurrently with block animation start
    });
  });
}
