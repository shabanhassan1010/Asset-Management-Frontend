import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

// Two small buttons: light/dark and English/Arabic.
// Shared because it is used in two places: the top bar (logged in) and the login page.
@Component({
  selector: 'app-preferences-toggle',
  imports: [TranslatePipe],
  templateUrl: './preferences-toggle.html',
  styleUrl: './preferences-toggle.css',
})
export class PreferencesToggle {
  protected theme = inject(ThemeService);
  protected language = inject(LanguageService);
}
