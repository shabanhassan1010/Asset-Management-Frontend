export interface TransferDetails {
  id: number;
  transferDate: string;
  reason: string | null;

  assetId: number;
  assetName: string;
  assetCode: string;
  serialNumber: string | null;

  fromEmployeeName: string | null;
  fromDepartmentName: string | null;
  fromLocationName: string | null;

  toEmployeeName: string | null;
  toDepartmentName: string | null;
  toLocationName: string | null;

  transferredByName: string | null;
}