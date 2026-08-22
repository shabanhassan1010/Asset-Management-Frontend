import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardSummary } from '../models/Dashboard.model';
import { API } from '../api/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);


  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(API.dashboard.summary);
  }
}