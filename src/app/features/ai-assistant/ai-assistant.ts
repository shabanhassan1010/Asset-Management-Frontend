// src/app/features/ai-assistant/ai-assistant.ts
import { Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
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
 
  // Read straight from the service. Because the service outlives this
  // component, an old conversation is already here on the first render.
  readonly messages = this.aiService.messages;
  readonly loading = this.aiService.loading;
 
  // Shown on the empty screen. An empty state is an invitation to act, and these
  // also teach the shapes the assistant understands - which saves the person
  // from guessing and getting "I can only answer questions about assets".
  readonly suggestions = [
    'Which assets are currently available?',
    'How many Dell laptops do we have?',
    'Show me all laptops assigned to the Presales department',
    'Which assets are assigned to me?',
  ];
 
  constructor() {
    // effect() re-runs whenever a signal it reads changes. Reading messages()
    // here means: scroll on every new message, AND once on the first render —
    // which is what puts a restored conversation at the bottom instead of the top.
    effect(() => {
      this.messages();
      this.scrollToBottom();
    });
  }
 
  // The "New chat" button. This is the only place in the UI that wipes the
  // conversation, and it also asks the backend for a fresh sessionId.
  clear(): void {
    this.aiService.resetSession();
    this.question.set('');
  }
 
  useSuggestion(text: string): void {
    this.question.set(text);
    this.ask();
  }
 
  ask(): void {
    const text = this.question().trim();
 
    if (!text || this.loading()) {
      return;
    }
 
    // The service appends the message, calls the API and flips loading.
    this.aiService.ask(text);
    this.question.set('');
  }
 
  // Whether to show the cost column is decided by the data, not by the role.
  // The API omits purchaseCost for non-admins, so the column simply has nothing
  // to show and disappears. The client holds no permission logic at all.
  showsCost(assets: AssetQuestionResult[]): boolean {
    return assets.some((asset) => asset.purchaseCost !== undefined);
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
