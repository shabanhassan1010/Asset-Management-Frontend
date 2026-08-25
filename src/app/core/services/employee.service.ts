// src/app/core/services/employee.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { LookupService } from './LookupService';
import { API } from '../api/api-endpoints';
import { ApiResponse } from '../models/Api.Model';
import {
  CreateEmployeePayload,
  EmployeeDetails,
  EmployeePagedResult,
  EmployeeQuery,
  EmployeeRow,
  UpdateEmployeePayload,
} from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService
{
  private http = inject(HttpClient);
  private lookupService = inject(LookupService);

  list(query: EmployeeQuery): Observable<EmployeePagedResult<EmployeeRow>> 
  {
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber)
      .set('pageSize', query.pageSize);

    if (query.search.trim()) 
      params = params.set('search', query.search.trim());
    if (query.departmentId !== null) 
      params = params.set('departmentId', query.departmentId);
    if (query.isActive !== null) 
      params = params.set('isActive', query.isActive);

    return this.http.get<ApiResponse<EmployeePagedResult<EmployeeRow>>>(API.employees.paginated, { params })
                    .pipe(map(response => response.data));
  }

  getById(id: number): Observable<EmployeeDetails> 
  {
    return this.http.get<ApiResponse<EmployeeDetails>>(API.employees.byId(id))
                    .pipe(map(response => response.data));
  }

  create(payload: CreateEmployeePayload): Observable<unknown> 
  {
    return this.http.post(API.employees.base, payload).pipe(tap(() => this.lookupService.clearCache()));
  }

  update(id: number, payload: UpdateEmployeePayload): Observable<unknown> 
  {
    return this.http.put(API.employees.byId(id), payload).pipe(tap(() => this.lookupService.clearCache()));
  }

  setStatus(id: number, isActive: boolean): Observable<unknown> 
  {
    return this.http.patch(API.employees.status(id), { isActive }).pipe(tap(() => this.lookupService.clearCache()));
  }

}