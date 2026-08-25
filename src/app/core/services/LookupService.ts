// src/app/core/services/lookup.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, shareReplay } from 'rxjs';
import { AssetLookups, LookupItem } from '../models/Lookup.model';
import { API } from '../api/api-endpoints';
import { ApiResponse } from '../models/Api.Model';

@Injectable({ providedIn: 'root' })
export class LookupService 
{
  private http = inject(HttpClient);
 
  failedLookups = signal<string[]>([]);
  private cache$?: Observable<AssetLookups>;
 
  getAll(): Observable<AssetLookups> 
  {
    if (!this.cache$) {
      
      this.cache$ = forkJoin({
        categories:  this.list(API.lookups.categories,  'categoryName'),
        assetTypes:  this.list(API.lookups.assetTypes,  'assetTypeName'),
        departments: this.list(API.lookups.departments, 'departmentName'),
        locations:   this.list(API.lookups.locations,   'locationName'),
        employees:   this.list(API.lookups.employees,   'employeeName'),
      }).pipe(shareReplay(1));
    }
    return this.cache$;
  }
 
  clearCache(): void 
  {
    this.cache$ = undefined;
  }
 
  private list(url: string, nameField: string): Observable<LookupItem[]> 
  {
    return this.http.get<unknown>(url).pipe(
      map(response => {
        const body = response as Record<string, unknown>;
        const rows = (Array.isArray(response)
          ? response
          : body?.['data'] ?? body?.['items'] ?? []) as Record<string, unknown>[];
 
        return rows.map(row => ({
          id: row['id'] as number,
          name: (row[nameField] ?? row['name']) as string,
          isActive: (row['isActive'] ?? true) as boolean,
          departmentId: (row['departmentId'] ?? null) as number | null,
        }));
      }),
      catchError(error => {
        console.error(`[LookupService] failed: ${url}`, error.status, error.message);
        return of([] as LookupItem[]);
      })
    );
  }
}
