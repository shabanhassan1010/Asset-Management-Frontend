// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes-guard';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayout } from './layouts/main-layout/main-layout';
import { adminGuard } from './core/guards/adminGuard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
     // loadComponent: work using Lazy Loading which mean Angular does not need reload Fully [Login Compoent] in startup
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ], 
  },

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'assets',
        loadComponent: () =>
          import('./features/assets/asset-list/asset-list').then((m) => m.AssetList),
      },
      {
        path: 'assets/new',
        canMatch: [adminGuard],
        loadComponent: () =>
          import('./features/assets/asset-form/asset-form').then((m) => m.AssetForm),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'assets/:id',
        loadComponent: () =>
          import('./features/assets/asset-detail/asset-detail').then((m) => m.AssetDetail),
      },
      {
        path: 'assets/:id/transfer',
        canMatch: [adminGuard],
        loadComponent: () =>
          import('./features/assets/asset-transfer/asset-transfer').then((m) => m.AssetTransfer),
      },
      {
        path: 'assets/:id/edit',
        canMatch: [adminGuard],
        loadComponent: () =>
          import('./features/assets/asset-edit/asset-edit').then((m) => m.AssetEdit),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'lookups',
        canMatch: [adminGuard],
        loadComponent: () => import('./features/lookups/lookups').then((m) => m.Lookups),
      },
      {
        path: 'users',
        canMatch: [adminGuard],
        loadComponent: () => import('./features/users/users').then((m) => m.Users),
      },

      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'ask',
        loadComponent: () =>
          import('./features/ai-assistant/ai-assistant').then((m) => m.AiAssistant),
      },
    ],
  },

  {
    path: 'forbidden',
    loadComponent: () => import('./shared/components/forbidden/forbidden').then((m) => m.Forbidden),
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found').then((m) => m.NotFound),
  },
];
