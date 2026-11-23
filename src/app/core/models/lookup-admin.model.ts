export type LookupKind = 'category' | 'assetType' | 'department' | 'location';

export interface LookupRow {
  id: number;
  name: string;
  nameAr: string | null;
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
  nameArField: string;      // categoryNameAr / departmentNameAr / locationNameAr
  nameLabel: string;
  nameMaxLength: number;    // same as the DB column (and the backend validator)
  secondaryField: string;   // description / code / address
  secondaryLabel: string;
  secondaryRequired: boolean;
}

export const LOOKUP_KINDS: LookupKindConfig[] = [
  {
    kind: 'category', title: 'Categories', singular: 'category',
    nameField: 'categoryName', nameArField: 'categoryNameAr', nameLabel: 'Category name', nameMaxLength: 100,
    secondaryField: 'description', secondaryLabel: 'Description', secondaryRequired: false,
  },
  {
    kind: 'assetType', title: 'Asset Types', singular: 'asset type',
    nameField: 'assetTypeName', nameArField: 'assetTypeNameAr', nameLabel: 'Asset Type name', nameMaxLength: 100,
    secondaryField: 'description', secondaryLabel: 'Description', secondaryRequired: false,
  },
  {
    kind: 'department', title: 'Departments', singular: 'department',
    nameField: 'departmentName', nameArField: 'departmentNameAr', nameLabel: 'Department name', nameMaxLength: 150,
    secondaryField: 'code', secondaryLabel: 'Code', secondaryRequired: true,
  },
  {
    kind: 'location', title: 'Locations', singular: 'location',
    nameField: 'locationName', nameArField: 'locationNameAr', nameLabel: 'Location name', nameMaxLength: 150,
    secondaryField: 'address', secondaryLabel: 'Address', secondaryRequired: false,
  },
];