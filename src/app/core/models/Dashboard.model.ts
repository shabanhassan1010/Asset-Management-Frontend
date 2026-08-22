// src/app/core/models/dashboard.model.ts
// شكل الـ response اللي الـ dashboard مستنياه من الـ API.

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
  warrantyExpiryDate: string; // ISO date: '2026-09-29'
}

export interface DashboardSummary {
  activeAssets: number;
  retiredAssets: number;
  assignedAssets: number;
  availableAssets: number;
  underMaintenanceAssets: number;

  /** الـ API بيشيل المفتاح ده خالص لو اليوزر مش Admin — الإخفاء في الداتا مش في الزراير. */
  portfolioValue?: number | null;

  assetsByCategory: CategoryCount[];
  expiringWarranties: ExpiringWarranty[];
}