import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldProdPlotComponent } from './field-prod-plot.component';

describe('FieldProdPlotComponent', () => {
  let component: FieldProdPlotComponent;
  let fixture: ComponentFixture<FieldProdPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldProdPlotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldProdPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
