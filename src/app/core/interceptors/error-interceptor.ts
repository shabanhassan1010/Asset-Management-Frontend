import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/ToastService';
import { extractErrorMessage } from '../http-error';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (shouldNotify(error, req.url)) {
        toast.error(extractErrorMessage(error, 'Something went wrong. Please try again.'));
      }
 
      // Re-throw so the calling component still gets the error.
      return throwError(() => error);
    }),
  );
};

function shouldNotify(error: HttpErrorResponse, url: string): boolean {
  // Login / refresh: the login screen already shows its own message, and a
  // failed refresh just signs the user out. A toast would only add noise.
  if (url.includes('/auth/login') || url.includes('/auth/refresh'))
    return false;
 
  // 401 is already handled by authInterceptor (refresh, then sign out).
  // 403 already sends the user to the Forbidden page.
  if (error.status === 401 || error.status === 403)
    return false;
 
  // Everything else gets a toast: 400 validation, 404 not found,
  // 409 concurrency conflict, 500 server error, and status 0
  // (the API could not be reached at all — server down, CORS, no network).
  return true;
}
