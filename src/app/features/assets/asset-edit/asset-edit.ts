import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AssetListItem } from '../../../core/models/Asset.model';
import { AssetLookups } from '../../../core/models/Lookup.model';
import { AssetService } from '../../../core/services/AssetService';
import { LookupService } from '../../../core/services/LookupService';
import { extractErrorMessage } from '../../../core/http-error';

@Component({
  selector: 'app-asset-edit',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './asset-edit.html',
  styleUrl: './asset-edit.css',
})
export class AssetEdit {

  private fb = inject(FormBuilder);
  private assetService = inject(AssetService);
  private lookupService = inject(LookupService);
  private router = inject(Router);
 
  id = input.required<string>();
 
  asset = signal<AssetListItem | null>(null);
  lookups = signal<AssetLookups | null>(null);
  loading = signal(true);
  submitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
 
  private selectedDepartmentId = signal<number | null>(null);
 
  form = this.fb.nonNullable.group({
    assetCode: ['', [Validators.required, Validators.maxLength(50)]],
    assetName: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.maxLength(1000)],
    categoryId: ['', Validators.required],
    manufacturer: ['', Validators.maxLength(100)],
    model: ['', Validators.maxLength(100)],
    serialNumber: ['', Validators.maxLength(100)],
    purchaseDate: [''],
    purchaseCost: [''],
    warrantyExpiryDate: [''],
    departmentId: [''],
    assignedEmployeeId: [''],
    locationId: [''],
  });
 

  availableEmployees = computed(() => {
    const departmentId = this.selectedDepartmentId();
    if (!departmentId) return [];
    return (this.lookups()?.employees ?? []).filter(e => e.departmentId === departmentId);
  });
 
  constructor() {
    this.form.controls.departmentId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        this.selectedDepartmentId.set(value ? +value : null);
 
        const employeeId = this.form.controls.assignedEmployeeId.value;
        const stillValid = this.availableEmployees().some(e => e.id.toString() === employeeId);
        if (employeeId && !stillValid) {
          this.form.controls.assignedEmployeeId.setValue('');
        }
      });
  }
 
  ngOnInit(): void {
    this.assetService.getById(+this.id()).subscribe({
      next: data => {
        this.asset.set(data);
        this.selectedDepartmentId.set(data.departmentId ?? null);
        this.form.setValue({
          assetCode: data.assetCode,
          assetName: data.assetName,
          description: data.description ?? '',
          categoryId: data.categoryId.toString(),
          manufacturer: data.manufacturer ?? '',
          model: data.model ?? '',
          serialNumber: data.serialNumber ?? '',
          purchaseDate: data.purchaseDate ?? '',
          purchaseCost: data.purchaseCost?.toString() ?? '',
          warrantyExpiryDate: data.warrantyExpiryDate ?? '',
          departmentId: data.departmentId?.toString() ?? '',
          assignedEmployeeId: data.employeeId?.toString() ?? '',
          locationId: data.locationId?.toString() ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('This asset could not be loaded.');
        this.loading.set(false);
      },
    });
 
    this.lookupService.getAll().subscribe({
      next: data => this.lookups.set(data),
      error: () => {},
    });
  }
 

  canDeactivate(): boolean {
    if (!this.form.dirty || this.successMessage()) return true;
    return confirm('You have unsaved changes. Leave without saving?');
  }
 
  submit(): void {
    const current = this.asset();
    if (!current) return;
 
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    this.submitting.set(true);
    this.errorMessage.set('');
 
    const v = this.form.getRawValue();
 
    this.assetService.update(current.id, {
      assetId: current.id,
      assetCode: v.assetCode.trim(),
      assetName: v.assetName.trim(),
      description: v.description.trim() || null,
      categoryId: +v.categoryId,
      assetTypeId: current.assetTypeId,
      status: current.statusId,
      manufacturer: v.manufacturer.trim() || null,
      model: v.model.trim() || null,
      serialNumber: v.serialNumber.trim() || null,
      purchaseDate: v.purchaseDate || null,
      purchaseCost: v.purchaseCost ? +v.purchaseCost : null,
      warrantyExpiryDate: v.warrantyExpiryDate || null,
      departmentId: v.departmentId ? +v.departmentId : null,
      locationId: v.locationId ? +v.locationId : null,
      assignedEmployeeId: v.assignedEmployeeId ? +v.assignedEmployeeId : null,
      rowVersion: current.rowVersion,
    }).subscribe({
      next: response => {
        this.submitting.set(false);
        this.form.markAsPristine();  
        this.successMessage.set(response?.message || 'Asset updated successfully.');
        setTimeout(() => this.router.navigate(['/assets', current.id]), 1200);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(
          error.status === 409
            ? 'Someone else changed this asset while you were editing it. Reload and try again.'
            : extractErrorMessage(error, 'The changes could not be saved.')
        );
      },
    });
  }
  
}
