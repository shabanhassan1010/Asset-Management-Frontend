export type LookupKind = 'category' | 'department' | 'location';

export interface LookupRow {
  id: number;
  name: string;
  secondary: string | null;
  isActive: boolean;
  assetsCount: number;
  employeesCount: number | null;  
}

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
    secondaryField: 'code', secondaryLabel: 'Code', secondaryRequired: true,
  },
  {
    kind: 'location', title: 'Locations', singular: 'location',
    nameField: 'locationName', nameLabel: 'Location name',
    secondaryField: 'address', secondaryLabel: 'Address', secondaryRequired: false,
  },
];