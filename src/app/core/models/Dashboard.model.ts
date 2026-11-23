export interface CategoryCount {
  categoryId: number;
  categoryName: string;
  categoryNameAr: string | null;
  count: number;
}

export interface DepartmentCount {   
  departmentId: number | null;       
  departmentName: string;
  departmentNameAr: string | null;
  count: number;
}

export interface WarrantyWindow {   
  days: number;
  count: number;
}

export interface ExpiringWarranty {
  assetId: number;
  assetCode: string;
  assetName: string;
  statusId: number;
  statusName: string;
  warrantyExpiryDate: string; 
}

export interface DashboardSummary {
  activeAssets: number;
  retiredAssets: number;
  assignedAssets: number;
  availableAssets: number;
  underMaintenanceAssets: number;

  portfolioValue?: number | null;

  assetsByCategory: CategoryCount[];
  expiringWarranties: ExpiringWarranty[];
  assetsByDepartment: DepartmentCount[];   
  warrantyWindows: WarrantyWindow[];
}