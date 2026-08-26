// src/app/core/guards/auth-guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';


// route     : the current route
// state     : the current state for router
// state.Url : represent Url which user to use it
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },         // save component which user enter it  =>  /auth/login?returnUrl=/assets/15
  });
};


/*
                                                                    Not Logged In
                                                                          ↓
                                                                      authGuard
                                                                          ↓
                                                                      /auth/login
*/
