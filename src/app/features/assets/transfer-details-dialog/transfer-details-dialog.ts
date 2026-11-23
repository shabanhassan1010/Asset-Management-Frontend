import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { AssetService } from '../../../core/services/AssetService';
import { TransferDetails } from '../../../core/models/transfer-details.model';

import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocalNamePipe } from '../../../shared/pipes/local-name.pipe';
import { LocalizedDatePipe } from '../../../shared/pipes/localized-date.pipe';
@Component({
  selector: 'app-transfer-details-dialog',
  imports: [LocalizedDatePipe, TranslatePipe, LocalNamePipe],
  templateUrl: './transfer-details-dialog.html',
  styleUrl: './transfer-details-dialog.css',
})
export class TransferDetailsDialog implements OnInit {

  private assetService = inject(AssetService);

  assetId = input.required<number>();
  transferId = input.required<number>();
  closed = output<void>();

  transfer = signal<TransferDetails | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.assetService.getTransferDetails(this.assetId(), this.transferId()).subscribe({
      next: (data) => {
        this.transfer.set(data);
        this.loading.set(false);
      },
      error: () => this.close(), // الـ interceptor بيطلّع الـ toast
    });
  }

  close(): void {
    this.closed.emit();
  }
}
