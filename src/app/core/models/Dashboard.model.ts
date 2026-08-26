export interface CategoryCount {
  categoryName: string;
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
}