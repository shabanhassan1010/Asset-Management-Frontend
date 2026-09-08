import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/interceptors/error-interceptor';

// appConfig : Conatain Configuration for my project
export const appConfig: ApplicationConfig = {
  // providers : Store Angular Dependency Injection system like (http, service , Interceptors , router)
  providers: [
    provideBrowserGlobalErrorListeners(), // Record global error listeners related to Browser

    // provideHttpClient : mange HttpClient in Angular and without it angular can not give me HttpClient using Dependency Injection
    provideHttpClient(withInterceptors([errorInterceptor ,authInterceptor])),

    // routes : choose URl and Components
    // withComponentInputBinding : binding route data/parameters with component inputs
    provideRouter(routes, withComponentInputBinding()),
  ],
};

/*
           Angular Component
                  │
                  │ HTTP Request
                  ▼
            authInterceptor
                  │
                  │ Add Authorization: Bearer <JWT>
                  ▼
            errorInterceptor
                  │
                  ▼
            Backend API
                  │
                  ▼
            JWT Authentication
                  │
                  ▼
            Controller
                  │
                  ▼
            Application / MediatR
                  │
                  ▼
            Database
*/
