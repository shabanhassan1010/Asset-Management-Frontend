// src/app/core/guards/admin-guard.ts
import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';


export const adminGuard: CanMatchFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isAdmin() ? true : router.createUrlTree(['/forbidden']);
};
