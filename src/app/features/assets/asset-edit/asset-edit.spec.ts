import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetEdit } from './asset-edit/asset-edit';

describe('AssetEdit', () => {
  let component: AssetEdit;
  let fixture: ComponentFixture<AssetEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
