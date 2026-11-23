import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService, TranslateParams } from '../../core/services/language.service';

// Usage in a template:
//   {{ 'Sign in' | t }}
//   {{ 'Page {page} of {total}' | t: { page: pageNumber(), total: lastPage() } }}
//   [placeholder]="'Search…' | t"
//
// Why pure: false?
// A pure pipe only runs again when its INPUT changes. Here the input ('Sign in') never
// changes — the LANGUAGE does. An impure pipe runs on every render, reads the language
// signal, and so switches text instantly. The work is one dictionary lookup, so it is cheap.
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private language = inject(LanguageService);

  transform(text: string | null | undefined, params?: TranslateParams): string {
    return this.language.t(text, params);
  }
}
