import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly current = signal<ConfirmOptions | null>(null);

  private resolveFn: ((result: boolean) => void) | null = null;

  ask(options: ConfirmOptions): Promise<boolean> {
    this.resolveFn?.(false);

    this.current.set(options);
    return new Promise<boolean>(resolve => (this.resolveFn = resolve));
  }

  close(result: boolean): void {
    this.resolveFn?.(result);
    this.resolveFn = null;
    this.current.set(null);
  }
}