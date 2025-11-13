import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldProdPlotlyComponent } from './field-prod-plotly.component';

describe('FieldProdPlotlyComponent', () => {
  let component: FieldProdPlotlyComponent;
  let fixture: ComponentFixture<FieldProdPlotlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldProdPlotlyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldProdPlotlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
