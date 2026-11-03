import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/services/ToastService';
import { Toast } from './shared/toast/toast';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component/confirm-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, ConfirmDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // protected readonly title = signal('task');
  protected title = 'task';
    private toastService = inject(ToastService);

  constructor() {
    // TEMPORARY test — fires once when the app starts.
    this.toastService.info('TOAST TEST');
  }
}
