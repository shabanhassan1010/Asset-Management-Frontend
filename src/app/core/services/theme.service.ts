import { computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

// The same key is read by the small script in index.html (before Angular starts).
const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private document = inject(DOCUMENT);

  private readonly current = signal<Theme>(this.readSaved());
  readonly theme = this.current.asReadonly();
  readonly isDark = computed(() => this.current() === 'dark');

  constructor() {
    // The whole dark mode is ONE attribute: <html data-theme="dark">.
    // styles.css swaps the colour variables under [data-theme='dark'],
    // and every component uses those variables, so nothing else has to change.
    effect(() => {
      const theme = this.current();
      this.document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(STORAGE_KEY, theme);
    });
  }

  toggle(): void {
    this.current.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }

  // First visit (nothing saved yet) → follow the operating system's setting.
  private readSaved(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}

/*
   click ☾  →  ThemeService.toggle()  →  current = 'dark'
                                              │
                                              ▼ effect
                              <html data-theme="dark">  +  localStorage
                                              │
                                              ▼
                 styles.css: [data-theme='dark'] { --bg: …; --surface: …; --text: … }
                                              │
                                              ▼
                       every card / table / button repaints with the dark colours
*/
