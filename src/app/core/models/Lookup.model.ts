// src/app/core/models/lookup.model.ts

// كل الـ lookups بترجع بنفس الشكل ده من الـ API.
// لو الباك اند بيرجّع أسماء مختلفة (categoryName بدل name مثلاً)،
// غيّر هنا وفي lookup.service.ts بس — الشاشات مش هتتأثر.
export interface LookupItem {
  id: number;
  name: string;
  isActive: boolean;

  /** للموظفين بس — القسم اللي الموظف تابع له، عشان الـ cascade في شاشة التحويل. */
  departmentId?: number | null;
}

// كل القوايم اللي شاشة الأصول محتاجاها في نداء واحد.
export interface AssetLookups {
  categories: LookupItem[];
  departments: LookupItem[];
  locations: LookupItem[];
  employees: LookupItem[];
  assetTypes: LookupItem[];
}
