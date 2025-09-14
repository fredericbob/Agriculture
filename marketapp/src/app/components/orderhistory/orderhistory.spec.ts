import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Orderhistory } from './orderhistory';

describe('Orderhistory', () => {
  let component: Orderhistory;
  let fixture: ComponentFixture<Orderhistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Orderhistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Orderhistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
