import { HttpErrorResponse } from '@angular/common/http';

export function extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
  const body = error.error;

  if (body?.errors && typeof body.errors === 'object') 
  {
    const messages = Object.values(body.errors as Record<string, string[]>).flat();
    if (messages.length) 
      return messages.join(' ');
  }

  return body?.message ?? body?.detail ?? body?.title ?? fallback;
}