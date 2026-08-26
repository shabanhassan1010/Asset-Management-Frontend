// src/app/core/guards/admin-guard.ts
import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';


export const adminGuard: CanMatchFn = () => 
{
  const auth = inject(Auth);
  const router = inject(Router);

  
  if(auth.isAdmin()){
    return true;
  }
  return router.createUrlTree(['/forbidden']);   // UrlTree == Navigate but use UrlTree because router work fine with it 
};


/*
                                                                Logged In User
                                                                      ↓
                                                                  adminGuard
                                                                       ↓
                                                                  ┌────┴────┐
                                                                  Admin     User
                                                                  ↓          ↓
                                                                Allow     Forbidden
*/