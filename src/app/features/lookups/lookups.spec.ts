import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lookups } from './lookups';

describe('Lookups', () => {
  let component: Lookups;
  let fixture: ComponentFixture<Lookups>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lookups]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lookups);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
