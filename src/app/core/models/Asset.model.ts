// src/app/core/models/asset.model.ts

// شكل الـ response بتاع PaginatedResponse<T> من الباك اند بالظبط.
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

  // الـ API بيشيل المفتاح ده خالص لو اليوزر مش Admin (R2.6).
  purchaseCost?: number | null;

  rowVersion: string;
}

// الفلاتر اللي بتتبعت كـ query string. كلها اختيارية عدا الصفحة والحجم.
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

// مفيش جدول Statuses في الداتابيز — القائمة بتتبنى من الـ enum بتاع الباك اند.
export const ASSET_STATUSES = [
  { id: 1, name: 'Available' },
  { id: 2, name: 'Assigned' },
  { id: 3, name: 'Under Maintenance' },
  { id: 4, name: 'Retired' },
];

export const RETIRED_STATUS_ID = 4;

// سجل تحويل واحد في تاريخ الأصل (R3.2) — مطابق لـ GetAssetTransferHistoryResponse.
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

// R3.1 — طلب تحويل أصل.
// كل الحقول اختيارية ما عدا rowVersion: التحويل ممكن يغيّر القسم بس،
// أو الموظف بس، أو الاتنين مع الموقع.
export interface CreateTransferRequest {
  toDepartmentId: number | null;
  toEmployeeId: number | null;
  toLocationId: number | null;
  transferDate: string;      // ISO — الفرونت بيبعت وقت التنفيذ
  reason: string | null;
  rowVersion: string;
}

/** الشكل الملفوف اللي أغلب الـ endpoints بترجّعه. */
export interface ApiMessage {
  success: boolean;
  message: string;
}

// R2.4 — طلب تعديل أصل. مطابق لـ UpdateAssetCommandModel بالظبط.
export interface UpdateAssetRequest {
  assetId: number;
  assetCode: string;
  assetName: string;
  description: string | null;
  categoryId: number;

  // AssetType و AssetTypeId حقلين منفصلين في الـ command رغم إنهم لنفس المعنى —
  // على الأغلب تكرار مش مقصود في الباك اند. بنبعت نفس القيمة في الاتنين.
  assetType: number;
  assetTypeId: number;

  // مش قابل للتعديل من هنا — بيتغيّر من شاشتي Transfer و Retire بس.
  // بنبعت نفس القيمة الحالية عشان الـ command يقبل الطلب.
  status: number;

  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchaseCost: number | null;

  // مفيش مصدر ليها في أي شاشة تانية — مثبتة "EGP" لحد ما يتضاف لها lookup.
  currencyCode: string;

  warrantyExpiryDate: string | null;
  departmentId: number | null;
  locationId: number | null;
  assignedEmployeeId: number | null;
  rowVersion: string;
}

// R2.4 — إنشاء أصل جديد. مطابق لـ CreateAssetCommandModel.
// مفيش assetId ولا rowVersion: الأصل لسه ما اتخلقش.
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