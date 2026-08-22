// src/app/core/models/lookup-admin.model.ts

export type LookupKind = 'category' | 'department' | 'location';

/**
 * صف موحّد لأي نوع lookup.
 * كل نوع ليه أسماء حقول مختلفة في الـ API (categoryName / departmentName /
 * locationName، و description / code / address) — بنترجمهم للشكل ده مرة واحدة
 * عشان الشاشة تتعامل مع نوع واحد بس.
 */
export interface LookupRow {
  id: number;
  name: string;
  secondary: string | null;
  isActive: boolean;
  assetsCount: number;
  employeesCount: number | null;   // للأقسام بس
}

/** تعريف كل نوع: العناوين وأسماء الحقول اللي الـ API متوقعها. */
export interface LookupKindConfig {
  kind: LookupKind;
  title: string;
  singular: string;
  nameField: string;        // categoryName / departmentName / locationName
  nameLabel: string;
  secondaryField: string;   // description / code / address
  secondaryLabel: string;
  secondaryRequired: boolean;
}

export const LOOKUP_KINDS: LookupKindConfig[] = [
  {
    kind: 'category', title: 'Categories', singular: 'category',
    nameField: 'categoryName', nameLabel: 'Category name',
    secondaryField: 'description', secondaryLabel: 'Description', secondaryRequired: false,
  },
  {
    kind: 'department', title: 'Departments', singular: 'department',
    nameField: 'departmentName', nameLabel: 'Department name',
    // الكود مطلوب في الداتابيز (NOT NULL, 20 حرف) — عشان كده required هنا.
    secondaryField: 'code', secondaryLabel: 'Code', secondaryRequired: true,
  },
  {
    kind: 'location', title: 'Locations', singular: 'location',
    nameField: 'locationName', nameLabel: 'Location name',
    secondaryField: 'address', secondaryLabel: 'Address', secondaryRequired: false,
  },
];