import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',                              // اتصلح
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
  host: { '(document:keydown.escape)': 'onEscape()' } 
})
export class ConfirmDialogComponent {
  protected readonly confirm = inject(ConfirmService);

  onEscape(): void {
    if (this.confirm.current()) this.confirm.close(false);
  }
}
