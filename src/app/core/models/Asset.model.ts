export interface PagedResult<T> {
  data: T[];
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface AssetListItem {
  id: number;
  assetCode: string;
  assetName: string;
  description?: string | null;

  categoryId: number;
  categoryName: string;
  assetTypeId: number;
  assetTypeName: string;

  statusId: number;
  statusName: string;

  manufacturer?: string | null;
  model?: string | null;
  serialNumber?: string | null;

  purchaseDate?: string | null;
  warrantyExpiryDate?: string | null;

  departmentId?: number | null;
  departmentName?: string | null;
  employeeId?: number | null;
  employeeName?: string | null;
  locationId?: number | null;
  locationName?: string | null;

  purchaseCost?: number | null;

  rowVersion: string;
}

export interface AssetFilters {
  pageNumber: number;
  pageSize: number;
  search: string;
  categoryId: string;
  assetTypeId: string;
  statusId: string;
  departmentId: string;
  locationId: string;
  employeeId: string;
  sortBy: string;
  sortDesc: boolean;
  includeRetired: boolean;
}

export const DEFAULT_FILTERS: AssetFilters = {
  pageNumber: 1,
  pageSize: 10,
  search: '',
  categoryId: '',
  assetTypeId: '',
  statusId: '',
  departmentId: '',
  locationId: '',
  employeeId: '',
  sortBy: 'assetCode',
  sortDesc: false,
  includeRetired: false,
};

export const ASSET_STATUSES = [
  { id: 1, name: 'Available' },
  { id: 2, name: 'Assigned' },
  { id: 3, name: 'Under Maintenance' },
  { id: 4, name: 'Retired' },
];

export const RETIRED_STATUS_ID = 4;

export interface AssetTransfer {
  id: number;
  transferDate: string;
  reason: string | null;
  transferredByUserId: string | null;

  fromEmployeeName: string | null;
  fromDepartmentName: string | null;
  fromLocationName: string | null;

  toEmployeeName: string | null;
  toDepartmentName: string | null;
  toLocationName: string | null;
}


export interface CreateTransferRequest {
  toDepartmentId: number | null;
  toEmployeeId: number | null;
  toLocationId: number | null;
  transferDate: string;      
  reason: string | null;
  rowVersion: string;
}

export interface ApiMessage {
  success: boolean;
  message: string;
}

export interface UpdateAssetRequest {
  assetId: number;
  assetCode: string;
  assetName: string;
  description: string | null;
  categoryId: number;


  assetTypeId: number;

  status: number;

  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchaseCost: number | null;

  warrantyExpiryDate: string | null;
  departmentId: number | null;
  locationId: number | null;
  assignedEmployeeId: number | null;
  rowVersion: string;
}


export interface CreateAssetRequest {
  assetCode: string;
  assetName: string;
  description: string | null;
  categoryId: number;
  assetTypeId: number;
  status: number;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchaseCost: number | null;
  warrantyExpiryDate: string | null;
  departmentId: number | null;
  assignedEmployeeId: number | null;
  locationId: number | null;
}

export interface RetireAssetRequest {
  reason: string;
  rowVersion: string;
}

export interface RetireAssetResponse {
  assetId: number;
  assetCode: string;
  status: number;
  retiredAt: string;
  rowVersion: string;
}