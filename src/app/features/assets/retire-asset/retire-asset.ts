import { Component, inject, input, output, signal } from '@angular/core';
import { AssetService } from '../../../core/services/AssetService';
import { ToastService } from '../../../core/services/ToastService';

@Component({
  selector: 'app-retire-asset',
  imports: [],
  templateUrl: './retire-asset.html',
  styleUrl: './retire-asset.css',
})
export class RetireAsset {

  private assetService = inject(AssetService);
  private toast = inject(ToastService);
  assetId = input.required<number>();
  assetCode = input.required<string>();
  assetName = input.required<string>();
  rowVersion = input.required<string>();

  retired = output<void>();
  cancelled = output<void>();

  reason = signal('');
  submitting = signal(false);
  errorMessage = signal('');

  staleRecord = signal(false);


  confirm(): void {
    const reason = this.reason().trim();
    if (!reason || this.submitting()) return;

    this.submitting.set(true);
    this.errorMessage.set('');
  this.assetService
      .retire(this.assetId(), { reason, rowVersion: this.rowVersion() })
      .subscribe({
        next: () => {
          this.submitting.set(false);
                    this.toast.success(`"${this.assetCode()}" was retired.`);
          this.retired.emit();
        },
        error: (err) => {
          this.submitting.set(false);

          if (err.status === 409) {
            this.staleRecord.set(true);
            this.errorMessage.set(
              'This asset was changed by someone else. Close this dialog and reload before trying again.',
            );
            return;
          }


          this.errorMessage.set(
            err.error?.detail ?? 'Could not retire the asset. Please try again.',
          );
        },
      });
  }

  cancel(): void {
    if (this.submitting()) return;
    this.cancelled.emit();
  }

}
