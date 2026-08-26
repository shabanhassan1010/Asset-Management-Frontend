import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse, CurrentUser, LoginRequest, UserRole } from '../models/auth.model';
// shareReplay : Use it in refresh token when more then Subscriber comman in the same HTTP request instead of sent many requests
import { finalize, Observable, shareReplay, tap } from 'rxjs';
import { API } from '../api/api-endpoints';


const ACCESS_TOKEN_KEY = 'ams.accessToken';
const REFRESH_TOKEN_KEY = 'ams.refreshToken';
const USER_KEY = 'ams.user';

@Injectable({providedIn: 'root'})
export class Auth 
{
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<CurrentUser | null>(this.readStoredUser());  // store the currentUser

  isLoggedIn  = computed(() => this.currentUser() !== null);
  isAdmin     = computed(() => this.currentUser()?.role === UserRole.Admin);
  displayName = computed(() => this.currentUser()?.userName ?? '');


  private refreshInFlight: Observable<AuthResponse> | null = null;

  get accessToken(): string | null 
  {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> 
  {
    console.log('LOGIN URL =', API.auth.login);
    return this.http.post<AuthResponse>(API.auth.login, credentials)
                    .pipe(tap(response => this.storeSession(response)));
  }

  refresh(): Observable<AuthResponse> 
  {
    if (this.refreshInFlight) 
    {
      return this.refreshInFlight;
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    this.refreshInFlight = this.http.post<AuthResponse>(API.auth.refresh, { refreshToken })
                                    .pipe(tap(response => this.storeSession(response)), finalize(() => (this.refreshInFlight = null)),shareReplay(1));

    return this.refreshInFlight;
  }

  logout(): void 
  {
    // Get refreshToken
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (refreshToken) 
    {
      // I will sent request into logout Endpoint
      this.http.post(API.auth.logout, { refreshToken })
               .subscribe({ error: () => {}, });  // I Use subscribe Here because [Http Observable] will not exceute if subscription no Found
    }

    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  forceSignOut(returnUrl?: string): void 
  {
    this.clearSession();
    this.router.navigate(['/auth/login'], {
      queryParams: returnUrl ? { returnUrl } : undefined,
    });
  }

  private storeSession(response: AuthResponse): void 
  {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  private clearSession(): void 
  {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  private readStoredUser(): CurrentUser | null 
  {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try{
      return JSON.parse(raw) as CurrentUser;
    } 
    catch{
      return null;
    }
  }
}


/*
                                                                  Auth Service
                                                                      |
                                                    ┌─────────────────┼─────────────────┐
                                                    ↓                 ↓                 ↓
                                                  Login             Logout            Refresh
                                                    |                 |                 |
                                                    ↓                 ↓                 ↓
                                               storeSession()    clearSession()    storeSession()
                                                    |                 |                 |
                                                    └─────────────────┼─────────────────┘
                                                                      ↓
                                                                  localStorage
                                                                      +
                                                                  currentUser
                                                                      |
                                                            ┌──────────┼──────────┐
                                                            ↓          ↓          ↓
                                                        isLoggedIn   isAdmin   displayName
                                                            |          |
                                                            ↓          ↓
                                                        authGuard   adminGuard
*/