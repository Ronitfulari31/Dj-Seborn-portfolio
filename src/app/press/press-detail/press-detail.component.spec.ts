import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PressDetailComponent } from './press-detail.component';

describe('PressDetailComponent', () => {
  let component: PressDetailComponent;
  let fixture: ComponentFixture<PressDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PressDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PressDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
