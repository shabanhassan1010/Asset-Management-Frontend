// src/app/core/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AvailableEmployee, CreateUserRequest, PagedUsers, UserFilters, UserListItem } from '../models/user.model';
import { CurrentUser, UserRole } from '../models/auth.model';
import { API } from '../api/api-endpoints';

@Injectable({ providedIn: 'root' })
export class UserService 
{
  private http = inject(HttpClient);

  getUsers(filters: UserFilters): Observable<PagedUsers> 
  {
    let params = new HttpParams().set('pageNumber', filters.pageNumber).set('pageSize', filters.pageSize);

    if (filters.search.trim()) 
      params = params.set('search', filters.search.trim());
    if (filters.role !== null) 
      params = params.set('role', filters.role);
    if (filters.isActive !== null) 
      params = params.set('isActive', filters.isActive);

    return this.http.get<PagedUsers>(API.users.list, { params });
  }

  create(request: CreateUserRequest): Observable<UserListItem> 
  {
    return this.http.post<UserListItem>(API.users.create, request);
  }

  changeRole(userId: string, role: UserRole): Observable<void> 
  {
    return this.http.put<void>(API.users.role(userId), { role });
  }

  changeStatus(userId: string, isActive: boolean): Observable<void> 
  {
    return this.http.put<void>(API.users.status(userId), { isActive });
  }

  getAvailableEmployees(departmentId: number): Observable<AvailableEmployee[]> 
  {
  return this.http.get<AvailableEmployee[]>(API.employees.availableForUser(departmentId));
  }

  me(): Observable<CurrentUser> 
  {
    return this.http.get<CurrentUser>(API.auth.me);
  }
}