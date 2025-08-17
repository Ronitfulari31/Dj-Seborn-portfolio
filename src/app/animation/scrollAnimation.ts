// import { Injectable } from '@angular/core';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// gsap.registerPlugin(ScrollTrigger);

// @Injectable({ providedIn: 'root' })
// export class ScrollAnimationHelper {
//   initScrollAnimations() {
//     if (typeof window === 'undefined') return; // SSR guard
//     console.log("GSAP scroll animation triggered"); // debug

//     gsap.utils.toArray<HTMLElement>('.fade-in-on-scroll').forEach((elem) => {
//       gsap.fromTo(elem,
//         { opacity: 0, y: 40 },
//         {
//           opacity: 1,
//           y: 0,
//           x: 5,
//           duration: 2,
//           ease: 'power3.out',
//           scrollTrigger: {
//             trigger: elem,
//             start: 'top 90%',
//             toggleActions: 'restart pauser restart pause',
            
//           }
//         }
//       );
//     });
//   }
//   initStaggeredAnimations() {
//   if (typeof window === 'undefined') return;  // Prevent SSR issues
  
//   gsap.utils.toArray<HTMLElement>('.stagger-fade-in').forEach((container) => {
//     if (!container) return;                // Defensive check
    
//     if (container.children.length === 0) return; // No children to animate
    
//     gsap.from(container.children, {
//       opacity: 0,
//       y: 30,
//       duration: 0.8,
//       ease: 'power3.out',
//       stagger: 0.15,
//       scrollTrigger: {
//         trigger: container,
//         start: 'top 80%',
//         toggleActions: 'reset none none reset',
//       }
//     });
//   });
// }


// animateSplitText(selector: string = '.split-text .char') {
//   if (typeof window === 'undefined') return; // SSR guard

//   gsap.from(selector, {
//     opacity: 0,
//     y: 50,
//     rotationX: -90,
//     duration: 1,
//     stagger: 0.07,
//     ease: 'back.out(1.7)'
//   });
// }


// }
