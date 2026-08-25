// HttpErrorResponse: Represents an HTTP error returned from the backend.
// HttpInterceptorFn: Type used to define a functional HTTP interceptor.
// HttpRequest: Represents an HTTP request sent from Angular.
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';    // inject(): Allows us to get Angular services using Dependency Injection.
import { Router } from '@angular/router'; // Router: Used to navigate between Angular application routes.
import { catchError, switchMap, throwError } from 'rxjs';
import { Auth } from '../services/auth';  // Auth: Our authentication service that manages tokens, refresh, logout, etc.

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Defines a functional HTTP interceptor.
  // req: The current HTTP request.
  // next: Sends the request to the next interceptor or to the backend.

  const auth = inject(Auth); // Gets an instance of the Auth service using Angular Dependency Injection.
  const router = inject(Router); // Gets an instance of Angular Router using Dependency Injection.

  // Checks whether the current request is a Login or Refresh request. We do not add the access token to these requests.
  const isAuthCall = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  // If this is a Login/Refresh request, use the original request. Otherwise, add the current access token to the request.
  const request = isAuthCall ? req : withToken(req, auth.accessToken);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {   // Sends the request to the backend and starts processing the response.
      if (error.status === 403) {
        router.navigate(['/forbidden']);       // Navigates the user to the Forbidden page.
        return throwError(() => error);
      }

      if (error.status !== 401 || isAuthCall) {
        return throwError(() => error);
      }

      return auth.refresh().pipe(
        //    After the refresh succeeds:
        // 1. Get the original request.
        // 2. Add the new access token to it.
        // 3. Send the original request again.
        switchMap(() => next(withToken(req, auth.accessToken))),
        catchError((refreshError) => {
          auth.forceSignOut(router.url);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};


// Helper function that adds an access token to an HTTP request.
// req:   The original HTTP request
// token: The access token, or null if no token exists.
// Returns a new HttpRequest.
function withToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (!token) return req;
 // If there is no access token, return the original request unchanged.
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
