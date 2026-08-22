// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes-guard';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayout } from './layouts/main-layout/main-layout';
import { adminGuard } from './core/guards/adminGuard';

export const routes: Routes = [
  // مسارات اللوجين — layout من غير سايدبار، ومن غير جارد.
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // كل الباقي محمي — الجارد متحطوط على الأب مرة واحدة بدل ما يتكرر جوه (R6.1).
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'assets',
        loadComponent: () =>
          import('./features/assets/asset-list/asset-list').then(m => m.AssetList),
      },
      {
        // لازم قبل 'assets/:id' وإلا الراوتر هيفسّر "new" كـ id
        path: 'assets/new',
        canMatch: [adminGuard],
        loadComponent: () =>
          import('./features/assets/asset-form/asset-form').then(m => m.AssetForm),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'assets/:id',
        loadComponent: () =>
          import('./features/assets/asset-detail/asset-detail').then(m => m.AssetDetail),
      },
      {
        path: 'assets/:id/transfer',
        canMatch: [adminGuard],   // R6.2 — الملف نفسه ما بيتحمّلش لليوزر
        loadComponent: () =>
          import('./features/assets/asset-transfer/asset-transfer').then(m => m.AssetTransfer),
      },
      {
        path: 'assets/:id/edit',
        canMatch: [adminGuard],
        loadComponent: () =>
          import('./features/assets/asset-edit/asset-edit').then(m => m.AssetEdit),
        canDeactivate: [unsavedChangesGuard],   // R6.4 — تحذير عند الخروج من فورم فيه تعديلات
      },
      {
        path: 'lookups',
        canMatch: [adminGuard],
        loadComponent: () => import('./features/lookups/lookups').then(m => m.Lookups),
      },
      {
        path: 'users',
        canMatch: [adminGuard],
        loadComponent: () => import('./features/users/users').then(m => m.Users),
      },
 
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then(m => m.Profile),
      },
            {
        // متاحة للدورين — الفرق بيظهر في الداتا مش في الوصول (R4.3)
        path: 'ask',
        loadComponent: () =>
          import('./features/ai-assistant/ai-assistant').then(m => m.AiAssistant),
      },
      // الشاشات الجاية: assets/new · ask / lookups / users / profile
      // كل واحدة بتضاف هنا بنفس الشكل: { path: '...', loadComponent: () => import(...).then(m => m.Xyz) }
    ],
  },

  {
    path: 'forbidden',
    loadComponent: () =>
      import('./shared/components/forbidden/forbidden').then(m => m.Forbidden),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found').then(m => m.NotFound),
  },
];