import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DinamikGridComponent } from './dinamik-grid.component';

describe('DinamikGridComponent', () => {
  let component: DinamikGridComponent;
  let fixture: ComponentFixture<DinamikGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DinamikGridComponent]
    });
    fixture = TestBed.createComponent(DinamikGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
