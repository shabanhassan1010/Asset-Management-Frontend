import { formatDate } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

// Same as Angular's | date pipe, but it follows the language the user picked:
//   English → 10 Dec 2026
//   Arabic  → 10 ديسمبر 2026
// Usage: {{ asset.purchaseDate | appDate:'dd MMM yyyy' }}
//
// Why not the built-in | date?
// It uses LOCALE_ID, which is fixed once when the app starts. The language here
// changes at runtime, so this pipe passes the current locale on every call.
// pure: false for the same reason as the t pipe — the input stays the same,
// only the language changes.
@Pipe({ name: 'appDate', pure: false })
export class LocalizedDatePipe implements PipeTransform {
  private language = inject(LanguageService);

  transform(value: string | number | Date | null | undefined, format = 'mediumDate'): string {
    if (value === null || value === undefined || value === '') return '';
    return formatDate(value, format, this.language.locale());
  }
}
