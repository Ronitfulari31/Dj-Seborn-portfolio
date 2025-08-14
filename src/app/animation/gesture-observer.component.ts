import { GestureService } from './../services/gesture.service';
import { AfterViewInit, Component, NgZone, OnDestroy } from '@angular/core';


@Component({
  selector: 'app-gesture-observer',
  template: '',
  standalone: true,
})
export class GestureObserverComponent implements AfterViewInit, OnDestroy {
  constructor(private GestureService: GestureService) {}

  ngAfterViewInit() {
    // GestureService already initializes Observer in constructor,
    // so no extra code needed here unless you want to pass a different target.
  }

  ngOnDestroy() {
    this.GestureService.destroy();
  }
}
