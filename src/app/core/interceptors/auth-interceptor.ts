// src/app/core/interceptors/auth-interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { Auth } from '../services/auth';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const isAuthCall = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  const request = isAuthCall ? req : withToken(req, auth.accessToken);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        router.navigate(['/forbidden']);
        return throwError(() => error);
      }

      if (error.status !== 401 || isAuthCall) {
        return throwError(() => error);
      }

      return auth.refresh().pipe(
        switchMap(() => next(withToken(req, auth.accessToken))),
        catchError((refreshError) => {

          auth.forceSignOut(router.url);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function withToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (!token) return req;

  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
