import { computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { AR } from '../i18n/ar';

export type Language = 'en' | 'ar';

// Values that fill the {placeholders} in a text, e.g. { page: 2, total: 10 }.
export type TranslateParams = Record<string, string | number | null | undefined>;

// The same key is read by the small script in index.html (before Angular starts).
const STORAGE_KEY = 'language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private document = inject(DOCUMENT);

  // Private + asReadonly(): only setLanguage()/toggle() can change it.
  private readonly current = signal<Language>(this.readSaved());
  readonly language = this.current.asReadonly();
  readonly isArabic = computed(() => this.current() === 'ar');

  // The Angular locale used to format dates (see LocalizedDatePipe).
  // 'ar' gives Arabic month names with the same 0-9 digits used everywhere else in the app.
  // Its data is registered once in app.config.ts (registerLocaleData).
  readonly locale = computed(() => (this.current() === 'ar' ? 'ar' : 'en-US'));

  constructor() {
    // Runs once now, then again every time the language changes.
    // lang  → screen readers and fonts know which language the page is.
    // dir   → the browser flips the whole layout right-to-left for Arabic.
    effect(() => {
      const language = this.current();
      const html = this.document.documentElement;
      html.lang = language;
      html.dir = language === 'ar' ? 'rtl' : 'ltr';
      localStorage.setItem(STORAGE_KEY, language);
    });
  }

  setLanguage(language: Language): void {
    this.current.set(language);
  }

  toggle(): void {
    this.current.update((language) => (language === 'ar' ? 'en' : 'ar'));
  }

  /**
   * The English text IS the key: t('Sign in') → 'تسجيل الدخول' in Arabic, 'Sign in' in English.
   * A text that has no Arabic entry (a server message, an asset name) comes back unchanged,
   * so passing data through t() is always safe.
   * {name} placeholders are filled from params AFTER translating, so Arabic can put
   * the value in a different place in the sentence.
   */
  t(text: string | null | undefined, params?: TranslateParams): string {
    if (!text) return '';

    // Look up the trimmed text, but keep the spaces around it (e.g. ' (inactive)').
    const key = text.trim();
    const translated = this.current() === 'ar' ? (AR[key] ?? key) : key;
    const result = key ? text.replace(key, translated) : text;

    if (!params) return result;
    return result.replace(/\{(\w+)\}/g, (match, name: string) =>
      params[name] != null ? String(params[name]) : match,
    );
  }

  /**
   * Picks the name to show for a row that has an English and an Arabic name
   * (categoryName / categoryNameAr, fullName / fullNameAr …).
   * Falls back to English when the Arabic name was never entered (null or empty).
   */
  pick(english: string | null | undefined, arabic: string | null | undefined): string {
    if (this.isArabic() && arabic?.trim()) return arabic;
    return english ?? '';
  }

  private readSaved(): Language {
    return localStorage.getItem(STORAGE_KEY) === 'ar' ? 'ar' : 'en';
  }
}

/*
     User clicks "العربية"
              │
              ▼
   LanguageService.toggle()  ──▶  current signal = 'ar'
              │                         │
              │                         ├─▶ effect: <html lang="ar" dir="rtl">, localStorage
              │                         │
              ▼                         ▼
   every {{ 'Text' | t }} in the templates reads current()
   → Angular re-renders them in Arabic (no page reload)
*/
