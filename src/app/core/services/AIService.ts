import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AssetQuestionResponse } from '../models/ai.model';
import { ApiResponse } from '../models/Api.Model';
import { API } from '../api/api-endpoints';
@Injectable({
  providedIn: 'root',
})
export class AIService {
    private readonly http = inject(HttpClient);

  ask(question: string): Observable<ApiResponse<AssetQuestionResponse>> {
    return this.http.post<ApiResponse<AssetQuestionResponse>>(API.ai.ask, { question });
  }
}
