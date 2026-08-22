// src/app/core/models/user.model.ts
import { UserRole } from './auth.model';

export interface UserListItem {
  userId: string;
  userName: string;
  email: string | null;
  role: UserRole;
  isActive: boolean;
  employeeId: number | null;
  createdAt: string;
}

// شكل PagedResult<T> بتاع اليوزرز — لاحظ إنه مختلف عن بتاع الأصول
// (items/totalCount هنا مقابل data/totalItems هناك).
export interface PagedUsers {
  items: UserListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateUserRequest {
  userName: string;
  email: string;
  password: string;
  role: UserRole;
  employeeId: number;

}

export interface UserFilters {
  search: string;
  role: UserRole | null;
  isActive: boolean | null;
  pageNumber: number;
  pageSize: number;
}

export const DEFAULT_USER_FILTERS: UserFilters = {
  search: '',
  role: null,
  isActive: null,
  pageNumber: 1,
  pageSize: 10,
};




export interface AvailableEmployee {
  id: number;
  fullName: string;
}