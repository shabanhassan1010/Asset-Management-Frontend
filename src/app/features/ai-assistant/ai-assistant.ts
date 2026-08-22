// src/app/features/ai-assistant/ai-assistant.ts
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { extractErrorMessage } from '../../core/http-error';
import { AssetQuestionResult, ChatMessage } from '../../core/models/ai.model';
import { Auth } from '../../core/services/auth';
import { FormsModule } from '@angular/forms';
import { AIService } from '../../core/services/AIService';

@Component({
  selector: 'app-ai-assistant',
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.html',
  styleUrl: './ai-assistant.css',
})
export class AiAssistant {
  private readonly aiService = inject(AIService);
 
  private readonly scrollBox = viewChild<ElementRef<HTMLDivElement>>('scrollBox');
 
  readonly question = signal('');
  readonly loading = signal(false);
  readonly messages = signal<ChatMessage[]>([]);
 
  // Shown on the empty screen. An empty state is an invitation to act, and these
  // also teach the shapes the assistant understands - which saves the person
  // from guessing and getting "I can only answer questions about assets".
  readonly suggestions = [
    'Which assets are currently available?',
    'How many Dell laptops do we have?',
    'Show me all laptops assigned to the Presales department',
    'Which assets are assigned to me?',
  ];
 
  useSuggestion(text: string): void {
    this.question.set(text);
    this.ask();
  }
 
  ask(): void {
    const text = this.question().trim();
 
    if (!text || this.loading()) {
      return;
    }
 
    this.append({ role: 'user', content: text });
    this.question.set('');
    this.loading.set(true);
 
    this.aiService.ask(text).subscribe({
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
 
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.append({
          role: 'assistant',
          content: this.describe(error),
          isError: true,
        });
 
        this.loading.set(false);
      },
    });
  }
 
  // Whether to show the cost column is decided by the data, not by the role.
  // The API omits purchaseCost for non-admins, so the column simply has nothing
  // to show and disappears. The client holds no permission logic at all.
  showsCost(assets: AssetQuestionResult[]): boolean {
    return assets.some((asset) => asset.purchaseCost !== undefined);
  }
 
  private append(message: ChatMessage): void {
    this.messages.update((current) => [...current, message]);
    this.scrollToBottom();
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
 
  private scrollToBottom(): void {
    // Deferred one tick so the new message is in the DOM before we measure it.
    setTimeout(() => {
      const box = this.scrollBox()?.nativeElement;
 
      if (box) {
        box.scrollTop = box.scrollHeight;
      }
    });
  }
}
