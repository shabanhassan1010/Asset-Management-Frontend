export interface LookupItem {
  id: number;
  name: string;
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
