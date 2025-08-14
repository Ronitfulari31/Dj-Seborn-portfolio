import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PressListComponent } from './press-list.component';

describe('PressListComponent', () => {
  let component: PressListComponent;
  let fixture: ComponentFixture<PressListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PressListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PressListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
