import { Injectable, signal } from '@angular/core';
import { ToastMessage, ToastType } from '../models/toast.model';

// Renamed the class from `Toast` to `ToastService` so it matches the other
// services (AssetService, LookupService) and does not clash with the
// `Toast` component in shared/components/toast.

@Injectable({
  providedIn: 'root', // one single instance for the whole app, so any component/interceptor can push a toast
})
export class ToastService {
  // The list of toasts currently on screen.
  // It is a signal so the component that renders it re-renders automatically
  // whenever we add or remove an item — no Subject/subscribe needed.
  // It is private so nothing outside this service can change the list directly.
  private readonly items = signal<ToastMessage[]>([]);

  // Read-only view for the template. Components can read it, but the only way
  // to change it is through the methods below.
  readonly toasts = this.items.asReadonly();

  // Simple counter used as the id. We only need a value that is unique inside
  // this browser tab, so a counter is enough — no uuid library needed.
  private nextId = 1;

  // How long a toast stays on screen, in milliseconds.
  private readonly durationMs = 4000;

  success(text: string): void {
    this.show('success', text);
  }

  error(text: string): void {
    this.show('error', text);
  }

  info(text: string): void {
    this.show('info', text);
  }

  show(type: ToastType, text: string): void {
    const id = this.nextId++;

    // update() gets the current list and returns a NEW array.
    // We must return a new array (not push into the old one) because a signal
    // compares by reference — mutating the same array would not trigger a re-render.
    this.items.update((list) => [...list, { id, type, text }]);

    // Auto-hide. dismiss() is safe to call even if the user already closed it,
    // because filter() simply finds nothing to remove.
    setTimeout(() => this.dismiss(id), this.durationMs);
  }

  dismiss(id: number): void {
    this.items.update((list) => list.filter((toast) => toast.id !== id));
  }
}
