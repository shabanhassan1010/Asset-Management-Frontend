export interface TransferDetails {
  id: number;
  transferDate: string;
  reason: string | null;

  assetId: number;
  assetName: string;
  assetCode: string;
  serialNumber: string | null;

  fromEmployeeName: string | null;
  fromEmployeeNameAr?: string | null;
  fromDepartmentName: string | null;
  fromDepartmentNameAr?: string | null;
  fromLocationName: string | null;
  fromLocationNameAr?: string | null;

  toEmployeeName: string | null;
  toEmployeeNameAr?: string | null;
  toDepartmentName: string | null;
  toDepartmentNameAr?: string | null;
  toLocationName: string | null;
  toLocationNameAr?: string | null;

  transferredByName: string | null;
}