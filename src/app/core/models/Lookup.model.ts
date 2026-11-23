export interface LookupItem {
  id: number;
  name: string;
  nameAr: string | null;      // null when no Arabic name was entered → show `name`
  isActive: boolean;
  departmentId?: number | null;
}

export interface AssetLookups {
  categories: LookupItem[];
  departments: LookupItem[];
  locations: LookupItem[];
  employees: LookupItem[];
  assetTypes: LookupItem[];
}