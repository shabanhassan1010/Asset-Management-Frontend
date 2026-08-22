// src/app/features/assets/asset-transfer/asset-transfer.ts
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AssetService } from '../../../core/services/AssetService';
import { LookupService } from '../../../core/services/LookupService';
import { AssetListItem } from '../../../core/models/Asset.model';
import { AssetLookups } from '../../../core/models/Lookup.model';
import { extractErrorMessage } from '../../../core/http-error';

@Component({
  selector: 'app-asset-transfer',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './asset-transfer.html',
})
export class AssetTransfer implements OnInit {

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
 
  // القسم المختار حالياً — signal منفصل عشان الـ cascade يتحدّث لوحده.
  private selectedDepartmentId = signal<number | null>(null);
 
  form = this.fb.nonNullable.group({
    toDepartmentId: [''],
    toEmployeeId: [''],
    toLocationId: [''],
    reason: ['', [Validators.required, Validators.maxLength(500)]],
  });
 
  /**
   * الموظفين المتاحين = موظفي القسم المختار بس.
   * من غير قسم مفيش موظفين — الموظف تابع لقسم، فاختياره قبل القسم ملوش معنى.
   */
  availableEmployees = computed(() => {
    const departmentId = this.selectedDepartmentId();
    if (!departmentId) return [];
    return (this.lookups()?.employees ?? []).filter(e => e.departmentId === departmentId);
  });
 
  constructor() {
    // أول ما القسم يتغيّر، بنفضّي الموظف لو مبقاش تابع للقسم الجديد —
    // وإلا هيتبعت موظف من قسم تاني خالص.
    this.form.controls.toDepartmentId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        this.selectedDepartmentId.set(value ? +value : null);
 
        // بعد تغيير القسم: لو الموظف الحالي مش تابع للقسم الجديد،
        // بنختار أول موظف في القسم تلقائياً — والقايمة مالهاش خيار "بدون موظف".
        const employees = this.availableEmployees();
        const currentId = this.form.controls.toEmployeeId.value;
        const stillValid = employees.some(e => e.id.toString() === currentId);
 
        if (!stillValid) {
          this.form.controls.toEmployeeId.setValue(
            employees.length ? employees[0].id.toString() : ''
          );
        }
      });
  }
 
  ngOnInit(): void {
    this.assetService.getById(+this.id()).subscribe({
      next: data => {
        this.asset.set(data);
        this.selectedDepartmentId.set(data.departmentId ?? null);
        this.form.patchValue({
          toDepartmentId: data.departmentId?.toString() ?? '',
          toEmployeeId: data.employeeId?.toString() ?? '',
          toLocationId: data.locationId?.toString() ?? '',
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
 
  /** التحويل لازم يغيّر مكان الأصل فعلاً — وإلا هو سطر فاضي في التاريخ. */
  hasChanges(): boolean {
    const a = this.asset();
    const v = this.form.getRawValue();
    if (!a) return false;
 
    return v.toDepartmentId !== (a.departmentId?.toString() ?? '')
        || v.toEmployeeId !== (a.employeeId?.toString() ?? '')
        || v.toLocationId !== (a.locationId?.toString() ?? '');
  }
 
  submit(): void {
    const current = this.asset();
    if (!current || !this.hasChanges()) return;
 
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    this.submitting.set(true);
    this.errorMessage.set('');
 
    const v = this.form.getRawValue();
 
    this.assetService.addTransfer(current.id, {
      toDepartmentId: v.toDepartmentId ? +v.toDepartmentId : null,
      toEmployeeId: v.toEmployeeId ? +v.toEmployeeId : null,
      toLocationId: v.toLocationId ? +v.toLocationId : null,
      transferDate: new Date().toISOString(),
      reason: v.reason.trim(),
      rowVersion: current.rowVersion,
    }).subscribe({
      next: response => {
        this.submitting.set(false);
        // بنعرض رسالة الباك اند نفسها لو موجودة، وبعدين نرجّع لصفحة الأصل.
        this.successMessage.set(response?.message || 'Transfer recorded successfully.');
        setTimeout(() => this.router.navigate(['/assets', current.id]), 1200);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(
          error.status === 409
            ? 'Someone else changed this asset while you were filling the form. Reload and try again.'
            : extractErrorMessage(error, 'The transfer could not be saved.')
        );
      },
    });
  }
}