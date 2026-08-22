// src/app/core/http-error.ts
import { HttpErrorResponse } from '@angular/common/http';

/**
 * الـ API بيرجّع شكلين مختلفين للأخطاء:
 *
 *  1) ProblemDetails للفاليديشن:
 *     { title, status, errors: { "AssetName": ["..."], "AssetCode": ["..."] } }
 *  2) BaseResponse لباقي الأخطاء:
 *     { succeeded: false, message: "..." }
 *
 * الدالة دي بتطلّع رسالة واحدة مقروءة من أي شكل فيهم، عشان الشاشات
 * ما تكررش نفس المنطق ده في كل كومبوننت.
 */
export function extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
  const body = error.error;

  // أخطاء الفاليديشن: بنجمع كل الرسايل في سطر واحد.
  if (body?.errors && typeof body.errors === 'object') {
    const messages = Object.values(body.errors as Record<string, string[]>).flat();
    if (messages.length) return messages.join(' ');
  }

  return body?.message ?? body?.detail ?? body?.title ?? fallback;
}