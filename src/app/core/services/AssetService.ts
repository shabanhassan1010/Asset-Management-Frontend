import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiMessage, AssetFilters, AssetListItem, AssetTransfer, CreateAssetRequest, CreateTransferRequest, PagedResult, RetireAssetRequest, RetireAssetResponse, UpdateAssetRequest } from '../models/Asset.model';
import { API } from '../api/api-endpoints';
import { ApiResponse } from '../models/Api.Model';

@Injectable({ providedIn: 'root' })
export class AssetService {

  private http = inject(HttpClient);
 
  getPaginated(filters: AssetFilters): Observable<PagedResult<AssetListItem>> 
  {
    return this.http.get<PagedResult<AssetListItem>>(API.assets.paginated, 
    {
      params: this.toParams(filters),
    });
  }
 
  getById(id: number): Observable<AssetListItem> 
  {
    return this.http.get<AssetListItem>(API.assets.byId(id));
  }

  getTransfers(id: number): Observable<AssetTransfer[]> 
  {
    return this.http.get<{ data: AssetTransfer[] }>(API.assets.transfers(id))
                    .pipe(map(response => response?.data ?? []));
  }
 

  addTransfer(id: number, request: CreateTransferRequest): Observable<ApiMessage> 
  {
    return this.http.post<ApiMessage>(API.assets.transfers(id), request);
  }
 

  create(request: CreateAssetRequest): Observable<ApiResponse<AssetListItem>> 
  {
    return this.http.post<ApiResponse<AssetListItem>>(API.assets.create, request);
  }
  

  update(id: number, request: UpdateAssetRequest): Observable<ApiResponse<AssetListItem>> 
  {
    return this.http.put<ApiResponse<AssetListItem>>(API.assets.byId(id), request);
  }
 
 
  retire(id: number, request: RetireAssetRequest): Observable<ApiResponse<RetireAssetResponse>>
  {
    return this.http.post<ApiResponse<RetireAssetResponse>>(API.assets.retire(id), request);
  }


 
 private toParams(filters: AssetFilters): HttpParams 
 {
    let params = new HttpParams().set('pageNumber', filters.pageNumber)
                                 .set('pageSize', filters.pageSize)
                                 .set('sortBy', filters.sortBy)
                                 .set('sortDesc', filters.sortDesc)
                                 .set('includeRetired', filters.includeRetired);
 
    if (filters.search.trim()) 
      params = params.set('search', filters.search.trim());
    if (filters.categoryId) 
      params = params.set('categoryId', filters.categoryId);
    if (filters.assetTypeId) 
      params = params.set('assetTypeId', filters.assetTypeId);
    if (filters.statusId) 
      params = params.set('statusId', filters.statusId);
    if (filters.departmentId) 
      params = params.set('departmentId', filters.departmentId);
    if (filters.locationId) 
      params = params.set('locationId', filters.locationId);
    if (filters.employeeId) 
      params = params.set('employeeId', filters.employeeId);
 
    return params;
  }
  
}
