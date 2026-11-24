export interface EmployeePagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Column Are Disaply only
export interface EmployeeRow {
  id: number;
  employeeCode: string;
  employeeName: string;
  employeeNameAr: string | null;
  departmentId: number;
  departmentName: string;
  departmentNameAr: string | null;
  isActive: boolean;
  email: string;
}

export interface EmployeeDetails extends EmployeeRow {
  id: number;
  employeeCode: string;
  fullName: string; //  employeeName
  fullNameAr: string | null;
  email: string;
  phone: string;
  departmentId: number;
  departmentName: string;
  isActive: boolean;
}

// No employeeCode: the server generates it (EMP-001, EMP-002, …).
export interface CreateEmployeePayload {
  fullName: string;
  fullNameAr: string | null;   // null = no Arabic name
  email: string;
  phone: string;
  departmentId: number;
}



// Same fields as create: the code is never sent, it can't be typed or changed.
export type UpdateEmployeePayload = CreateEmployeePayload;

export interface EmployeeQuery {
  pageNumber: number;
  pageSize: number;
  search: string;
  departmentId: number | null;
  isActive: boolean | null;
}
