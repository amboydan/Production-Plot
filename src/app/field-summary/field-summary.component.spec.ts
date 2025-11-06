import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldSummaryComponent } from './field-summary.component';

describe('FieldSummaryComponent', () => {
  let component: FieldSummaryComponent;
  let fixture: ComponentFixture<FieldSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
