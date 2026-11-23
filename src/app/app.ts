import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from './shared/toast/toast';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component/confirm-dialog.component';
import { LanguageService } from './core/services/language.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, ConfirmDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Injected here so both services start with the app, on every page (even 404).
  // Their constructors run the effects that keep <html lang/dir/data-theme> in sync.
  private language = inject(LanguageService);
  private theme = inject(ThemeService);
}
