import { Component, inject, input, output, signal } from '@angular/core';
import { AssetService } from '../../../core/services/AssetService';

@Component({
  selector: 'app-retire-asset',
  imports: [],
  templateUrl: './retire-asset.html',
  styleUrl: './retire-asset.css',
})
export class RetireAsset {

  private assetService = inject(AssetService);

  // بيتمرروا من الأب — الديالوج مش بيقرا الأصل بنفسه
  assetId = input.required<number>();
  assetCode = input.required<string>();
  assetName = input.required<string>();
  rowVersion = input.required<string>();

  retired = output<void>();
  cancelled = output<void>();

  reason = signal('');
  submitting = signal(false);
  errorMessage = signal('');

  // 409 معناها إن نسخة العميل بقت قديمة، فإعادة المحاولة من نفس
  // الشاشة مش هتنفع — لازم الأب يعيد التحميل الأول.
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

          // R6.6 — رسالة السيرفر زي ما هي. هو اللي عارف ليه العملية
          // اترفضت، مش الواجهة.
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
