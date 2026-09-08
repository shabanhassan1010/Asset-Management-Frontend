import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AssetQuestionResponse, ChatMessage } from '../models/ai.model';
import { ApiResponse } from '../models/Api.Model';
import { API } from '../api/api-endpoints';
@Injectable({
  providedIn: 'root',
})
export class AIService 
{
  private readonly http = inject(HttpClient);
  private sessionId = crypto.randomUUID();

  private readonly chat = signal<ChatMessage[]>([]);
  private readonly busy = signal(false);
 
  // Read-only views for the component: it can display them but only the
  // methods below can change them.
  readonly messages = this.chat.asReadonly();
  readonly loading = this.busy.asReadonly();
 
  ask(question: string): void {
    const text = question.trim();
 
    if (!text || this.busy()) {
      return;
    }
 
    this.append({ role: 'user', content: text });
    this.busy.set(true);
 
    this.http
      .post<ApiResponse<AssetQuestionResponse>>(API.ai.ask, {
        question: text,
        sessionId: this.sessionId,
      })
      .subscribe({
        // No takeUntilDestroyed here on purpose: the request belongs to the
        // service, not to the component. If the user navigates away while
        // waiting, the answer still lands in the conversation and is there
        // when they come back.
        next: (response) => {
          const data = response.data;
 
          if (response.success && data) {
            this.append({
              role: 'assistant',
              content: data.answer,
              assets: data.assets,
              totalCount: data.totalCount,
              suggestions: data.suggestions,
            });
          } else {
            this.append({
              role: 'assistant',
              content: response.message ?? 'I could not answer that question.',
              isError: true,
            });
          }
 
          this.busy.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.append({ role: 'assistant', content: this.describe(error), isError: true });
          this.busy.set(false);
        },
      });
  }

  resetSession(): void {
    this.chat.set([]);
    this.sessionId = crypto.randomUUID();
  }
  
  private append(message: ChatMessage): void {
    // A new array, not a push — a signal compares by reference.
    this.chat.update((current) => [...current, message]);
  }

  // An error message should say what happened and what to do next, in the
  // interface's own voice. It never shows the server's exception text -
  // the API does not send one, and the browser should not invent one.
  private describe(error: HttpErrorResponse): string {
    if (error.status === 429) {
      return 'You are asking questions faster than I can answer. Wait a few seconds and try again.';
    }
 
    if (error.status === 401 || error.status === 403) {
      return 'Your session has expired. Sign in again to keep asking questions.';
    }
 
    if (error.status === 0) {
      return 'I could not reach the server. Check your connection and try again.';
    }
 
    return 'Something went wrong while answering that. Try again in a moment.';
  }
}
