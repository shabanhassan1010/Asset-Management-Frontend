import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

// Tells the API which language the user picked, on EVERY request.
// Accept-Language is the standard HTTP header for this, and ASP.NET Core reads it
// out of the box (UseRequestLocalization), so the API needs no custom code to understand it.
// The API then answers success messages, errors and validation messages in that language.
export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const language = inject(LanguageService).language();   // 'en' | 'ar'
  return next(req.clone({ setHeaders: { 'Accept-Language': language } }));
};

/*
     User picks العربية → LanguageService.language() = 'ar'
                               │
     every HTTP request ──▶ languageInterceptor ──▶ header  Accept-Language: ar
                               │
                               ▼
     .NET API: UseRequestLocalization → CurrentUICulture = ar
              → messages from SharedResources.ar.resx
              → { "message": "تم تحديث الموظف بنجاح" }
*/
