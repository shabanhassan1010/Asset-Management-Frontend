import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
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

  demoAccounts = [
    { userName: 'admin', password: 'Admin@123', role: 'Admin', badgeClass: 'badge badge-admin' },
    { userName: 'user', password: 'User@123', role: 'User', badgeClass: 'badge badge-user' },
  ];

  fill(account: { userName: string; password: string }): void {
    this.form.setValue({ userName: account.userName, password: account.password });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.detail ?? 'The username or password is incorrect.');
        this.submitting.set(false);
      },
    });
  }
}
