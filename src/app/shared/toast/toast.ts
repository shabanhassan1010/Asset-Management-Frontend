import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/ToastService';

// This component only DISPLAYS the toasts. It holds no state of its own —
// the list lives in ToastService, so any part of the app can add a toast
// without needing a reference to this component.
// It is placed once in app.html, so it is always on screen.

@Component({
  selector: 'app-toast',
  imports: [], // no other component/pipe/directive is used in the template
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class Toast {
  private toastService = inject(ToastService);

  // Exposed to the template. It is the read-only signal from the service,
  // so the template re-renders by itself whenever the list changes.
  toasts = this.toastService.toasts;

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
