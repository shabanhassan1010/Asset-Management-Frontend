import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferDetailsDialog } from './transfer-details-dialog';

describe('TransferDetailsDialog', () => {
  let component: TransferDetailsDialog;
  let fixture: ComponentFixture<TransferDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferDetailsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferDetailsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
