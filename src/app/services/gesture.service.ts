import { Injectable, NgZone } from '@angular/core';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { Subject } from 'rxjs';

gsap.registerPlugin(Observer);

@Injectable({ providedIn: 'root' })
export class GestureService {
  scrollDown$ = new Subject<void>();
  scrollUp$ = new Subject<void>();

  private observer?: Observer;

  constructor(private ngZone: NgZone) {
    // Do NOT initialize observer here directly because window is undefined on SSR
  }

  /** Call this method manually only on browser platforms */
  public initObserver(target: Window | HTMLElement = window): void {
    if (typeof window === 'undefined') {
      // running on server, do nothing
      return;
    }
    if (this.observer) {
      this.observer.kill();
    }

    this.ngZone.runOutsideAngular(() => {
      this.observer = Observer.create({
        target,
        type: 'wheel,touch,pointer',
        tolerance: 10,
        preventDefault: true,
        onDown: () => this.ngZone.run(() => this.scrollDown$.next()),
        onUp: () => this.ngZone.run(() => this.scrollUp$.next()),
      });
    });
  }

  public destroy() {
    this.observer?.kill();
  }
}
