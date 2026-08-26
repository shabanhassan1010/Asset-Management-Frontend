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
  departmentId: number;
  departmentName: string;
  isActive: boolean;
}

export interface EmployeeDetails extends EmployeeRow {
  id: number;
  employeeCode: string;
  fullName: string; //  employeeName
  email: string;
  phone: string;
  departmentId: number;
  departmentName: string;
  isActive: boolean;
}

export interface CreateEmployeePayload {
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: number;
}



// Code not Accpet Update
export type UpdateEmployeePayload = Omit<CreateEmployeePayload, 'employeeCode'>;

export interface EmployeeQuery {
  pageNumber: number;
  pageSize: number;
  search: string;
  departmentId: number | null;
  isActive: boolean | null;
}
