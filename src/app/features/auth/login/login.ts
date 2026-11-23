import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { extractErrorMessage } from '../../../core/http-error';
import { PreferencesToggle } from '../../../shared/components/preferences-toggle/preferences-toggle';

import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, TranslatePipe, PreferencesToggle],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.nonNullable.group({
    userName: ['', Validators.required],
    password: ['', Validators.required],
  });

  submitting = signal(false);
  errorMessage = signal('');
 
  showPassword = signal(false);

  // Shown under the password box. Why: a wrong password because of Caps Lock is the most common login mistake.
  capsLockOn = signal(false);

  // For the footer "© 2026" — a plain field, it never changes while the page is open.
  readonly year = new Date().getFullYear();

  demoAccounts = [
    { userName: 'admin', password: 'Admin@123', role: 'Admin', badgeClass: 'badge badge-admin' },
    { userName: 'user', password: 'User@123', role: 'User', badgeClass: 'badge badge-user' },
  ];

  fill(account: { userName: string; password: string }): void {
    this.form.setValue({ userName: account.userName, password: account.password });
  }

  checkCapsLock(event: KeyboardEvent): void {
    // getModifierState is missing on some synthetic events (e.g. autofill), so guard it.
    this.capsLockOn.set(event.getModifierState?.('CapsLock') ?? false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(extractErrorMessage(error, 'The username or password is incorrect.'));
        this.submitting.set(false);
      },
    });
  }
}
