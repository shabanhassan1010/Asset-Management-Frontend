import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CanComponentDeactivate } from '../../../core/guards/unsaved-changes-guard';
import { extractErrorMessage } from '../../../core/http-error';
import { ASSET_STATUSES, RETIRED_STATUS_ID } from '../../../core/models/Asset.model';
import { AssetLookups } from '../../../core/models/Lookup.model';
import { AssetService } from '../../../core/services/AssetService';
import { LookupService } from '../../../core/services/LookupService';

@Component({
  selector: 'app-asset-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './asset-form.html',
  styleUrl: './asset-form.css',
})
export class AssetForm  implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private assetService = inject(AssetService);
  protected lookupService = inject(LookupService);
  
  private router = inject(Router);
 
  lookups = signal<AssetLookups | null>(null);
  submitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
 
  statuses = ASSET_STATUSES.filter(s => s.id !== RETIRED_STATUS_ID);
 
  private selectedDepartmentId = signal<number | null>(null);
 
  form = this.fb.nonNullable.group({
    assetCode: ['', [Validators.required, Validators.maxLength(50)]],
    assetName: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.maxLength(1000)],
    categoryId: ['', Validators.required],
    assetTypeId: ['', Validators.required],
    status: ['1', Validators.required],      
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
    return (this.lookups()?.employees ?? []).filter(e => Number(e.departmentId) === departmentId);
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    this.submitting.set(true);
    this.errorMessage.set('');
 
    const v = this.form.getRawValue();
 
    this.assetService.create({
      assetCode: v.assetCode.trim(),
      assetName: v.assetName.trim(),
      description: v.description.trim() || null,
      categoryId: +v.categoryId,
      assetTypeId: +v.assetTypeId,
      status: +v.status,
      manufacturer: v.manufacturer.trim() || null,
      model: v.model.trim() || null,
      serialNumber: v.serialNumber.trim() || null,
      purchaseDate: v.purchaseDate || null,
      purchaseCost: v.purchaseCost ? +v.purchaseCost : null,
      warrantyExpiryDate: v.warrantyExpiryDate || null,
      departmentId: v.departmentId ? +v.departmentId : null,
      assignedEmployeeId: v.assignedEmployeeId ? +v.assignedEmployeeId : null,
      locationId: v.locationId ? +v.locationId : null,
    }).subscribe({
      next: response => {
        this.submitting.set(false);
        this.form.markAsPristine();
        this.successMessage.set(response?.message || 'Asset created successfully.');
 
        const newId = response?.data?.id;
        setTimeout(
          () => this.router.navigate(newId ? ['/assets', newId] : ['/assets']),
          1200
        );
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(extractErrorMessage(error, 'The asset could not be created.'));
      },
    });
  }
}