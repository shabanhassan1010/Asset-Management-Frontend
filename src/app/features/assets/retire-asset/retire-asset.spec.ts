import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetireAsset } from './retire-asset';

describe('RetireAsset', () => {
  let component: RetireAsset;
  let fixture: ComponentFixture<RetireAsset>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetireAsset]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetireAsset);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
