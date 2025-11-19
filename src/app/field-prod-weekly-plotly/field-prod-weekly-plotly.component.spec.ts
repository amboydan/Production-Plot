import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldProdWeeklyPlotlyComponent } from './field-prod-weekly-plotly.component';

describe('FieldProdWeeklyPlotlyComponent', () => {
  let component: FieldProdWeeklyPlotlyComponent;
  let fixture: ComponentFixture<FieldProdWeeklyPlotlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldProdWeeklyPlotlyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldProdWeeklyPlotlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
