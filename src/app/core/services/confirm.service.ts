import { Injectable, inject, signal } from '@angular/core';
import { LanguageService, TranslateParams } from './language.service';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  // Values for {placeholders} in title/message, e.g. { name: row.name }.
  params?: TranslateParams;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private language = inject(LanguageService);

  readonly current = signal<ConfirmOptions | null>(null);

  private resolveFn: ((result: boolean) => void) | null = null;

  // Callers pass English text; it is translated here, in ONE place,
  // so the dialog component itself doesn't need to know about languages.
  ask(options: ConfirmOptions): Promise<boolean> {
    this.resolveFn?.(false);

    const t = (text: string) => this.language.t(text, options.params);
    this.current.set({
      ...options,
      title: t(options.title),
      message: t(options.message),
      confirmText: t(options.confirmText ?? 'Confirm'),
      cancelText: t(options.cancelText ?? 'Cancel'),
    });
    return new Promise<boolean>(resolve => (this.resolveFn = resolve));
  }

  close(result: boolean): void {
    this.resolveFn?.(result);
    this.resolveFn = null;
    this.current.set(null);
  }
}
