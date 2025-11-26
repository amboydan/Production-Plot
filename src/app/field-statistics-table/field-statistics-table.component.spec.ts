import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldStatisticsTableComponent } from './field-statistics-table.component';

describe('FieldStatisticsTableComponent', () => {
  let component: FieldStatisticsTableComponent;
  let fixture: ComponentFixture<FieldStatisticsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldStatisticsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldStatisticsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
