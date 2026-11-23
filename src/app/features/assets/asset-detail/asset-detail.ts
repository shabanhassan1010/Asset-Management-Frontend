// src/app/features/assets/asset-detail/asset-detail.ts
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { AssetService } from '../../../core/services/AssetService';
import { AssetListItem, AssetTransfer, RETIRED_STATUS_ID } from '../../../core/models/Asset.model';
import { TransferDetailsDialog } from '../transfer-details-dialog/transfer-details-dialog';
import { ConfirmService } from '../../../core/services/confirm.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocalNamePipe } from '../../../shared/pipes/local-name.pipe';
import { LocalizedDatePipe } from '../../../shared/pipes/localized-date.pipe';
@Component({
  selector: 'app-asset-detail',
  imports: [RouterLink, DecimalPipe, LocalizedDatePipe, TransferDetailsDialog, TranslatePipe, LocalNamePipe],
  templateUrl: './asset-detail.html',
})
export class AssetDetail implements OnInit {
  private assetService = inject(AssetService);
  private auth = inject(Auth);
  private router = inject(Router);
  private confirm = inject(ConfirmService);
  id = input.required<string>();

  isAdmin = this.auth.isAdmin;
  selectedTransferId = signal<number | null>(null);
  asset = signal<AssetListItem | null>(null);
  transfers = signal<AssetTransfer[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  retiring = signal(false);

  ngOnInit(): void {
    this.load();
  }

  openTransfer(transferId: number): void {
    if (!this.isAdmin()) return;        
    this.selectedTransferId.set(transferId);
  }

  closeTransfer(): void {
    this.selectedTransferId.set(null);
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.assetService.getById(+this.id()).subscribe({
      next: (data) => {
        this.asset.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('This asset could not be loaded. It may have been removed.');
        this.loading.set(false);
      },
    });

    this.assetService.getTransfers(+this.id()).subscribe({
      next: (rows) => this.transfers.set(rows),
      error: () => this.transfers.set([]),
    });
  }

  isRetired(): boolean {
    return this.asset()?.statusId === RETIRED_STATUS_ID;
  }

  // async: the app's confirm dialog answers with a Promise (translated + themed,
  // unlike the browser's confirm()).
  async retire(): Promise<void> {
    const current = this.asset();
    if (!current) return;

    const confirmed = await this.confirm.ask({
      title: 'Retire {code}?',
      message: 'The asset stays in the register for history, but it can no longer be edited or transferred.',
      confirmText: 'Retire',
      danger: true,
      params: { code: current.assetCode },
    });
    if (!confirmed) return;

    this.retiring.set(true);
    this.assetService.retire(current.id, {
        reason: 'Retired from the asset detail page',
        rowVersion: current.rowVersion,
      })
      .subscribe({
        next: () => {
          this.retiring.set(false);
          this.load(); 
        },
        error: (error) => {
          this.retiring.set(false);
          this.errorMessage.set(
            error.status === 409
              ? 'Someone else changed this asset while you were viewing it. Reload and try again.'
              : 'Could not retire this asset. Try again.',
          );
        },
      });
  }

  statusBadgeClass(statusId: number): string {
    switch (statusId) {
      case 1:
        return 'badge badge-available';
      case 2:
        return 'badge badge-assigned';
      case 3:
        return 'badge badge-maint';
      default:
        return 'badge badge-retired';
    }
  }
}
