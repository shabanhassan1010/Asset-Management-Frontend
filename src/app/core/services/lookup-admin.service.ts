// src/app/core/services/lookup-admin.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { LookupService } from './LookupService';
import { LookupKind, LookupKindConfig, LookupRow } from '../models/lookup-admin.model';
import { API } from '../api/api-endpoints';

@Injectable({ providedIn: 'root' })
export class LookupAdminService {
  private http = inject(HttpClient);
  private lookupService = inject(LookupService);

  private routes(kind: LookupKind) {
    return API.lookupAdmin[kind];
  }

  list(config: LookupKindConfig): Observable<LookupRow[]> {
    return this.http
      .get<{ data: Record<string, unknown>[] }>(this.routes(config.kind).list)
      .pipe(map(response => (response?.data ?? []).map(row => this.toRow(row, config))));
  }

  create(config: LookupKindConfig, name: string, secondary: string | null): Observable<unknown> {
    return this.http
      .post(this.routes(config.kind).create, this.toPayload(config, name, secondary))
      .pipe(tap(() => this.lookupService.clearCache()));
  }

  update(config: LookupKindConfig, id: number, name: string, secondary: string | null): Observable<unknown> {
    return this.http
      .put(this.routes(config.kind).byId(id), { id, ...this.toPayload(config, name, secondary) })
      .pipe(tap(() => this.lookupService.clearCache()));
  }


  deactivate(config: LookupKindConfig, id: number): Observable<unknown> {
    return this.http
      .delete(this.routes(config.kind).byId(id))
      .pipe(tap(() => this.lookupService.clearCache()));
  }

  private toRow(row: Record<string, unknown>, config: LookupKindConfig): LookupRow {
    return {
      id: row['id'] as number,
      name: (row[config.nameField] ?? '') as string,
      secondary: (row[config.secondaryField] ?? null) as string | null,
      isActive: (row['isActive'] ?? true) as boolean,
      assetsCount: (row['assetsCount'] ?? 0) as number,
      employeesCount: (row['employeesCount'] ?? null) as number | null,
    };
  }

  private toPayload(config: LookupKindConfig, name: string, secondary: string | null) {
    return {
      [config.nameField]: name,
      [config.secondaryField]: secondary,
    };
  }
}