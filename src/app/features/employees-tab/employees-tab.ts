// src/app/features/employees-tab/employees-tab.ts
import { Component, DestroyRef, OnInit, computed, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { extractErrorMessage } from '../../core/http-error';
import { EmployeeRow } from '../../core/models/employee.model';
import { LookupItem } from '../../core/models/Lookup.model';
import { EmployeeService } from '../../core/services/employee.service';
import { LookupService } from '../../core/services/LookupService';

@Component({
  selector: 'app-employees-tab',
  imports: [ReactiveFormsModule],
  templateUrl: './employees-tab.html',
})
export class EmployeesTab implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(EmployeeService);
  private lookupService = inject(LookupService);
  private destroyRef = inject(DestroyRef);

  rows = signal<EmployeeRow[]>([]);
  departments = signal<LookupItem[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  pageNumber = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  totalPages = signal(0);

  departmentFilter = signal<number | null>(null);
  statusFilter = signal<boolean | null>(null);
  searchControl = new FormControl('', { nonNullable: true });

  // null = الفورم مقفول، 0 = إضافة جديدة، رقم = تعديل الصف ده.
  editingId = signal<number | null>(null);
  saving = signal(false);
  loadingForm = signal(false);

  form = this.fb.nonNullable.group({
    employeeCode: ['', [Validators.required, Validators.maxLength(30)]],
    fullName: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    phone: ['', [Validators.maxLength(30)]],
    departmentId: [0, [Validators.required, Validators.min(1)]],
  });

  /** الأقسام الموقوفة بتفضل في الفلتر عشان تشوف موظفينها، بس مينفعش تنقل موظف ليها. */
  activeDepartments = computed(() => this.departments().filter(d => d.isActive));

  hasFilters = computed(
    () => !!this.searchControl.value.trim() || this.departmentFilter() !== null || this.statusFilter() !== null
  );

  ngOnInit(): void {
    this.lookupService.getAll().subscribe(lookups => this.departments.set(lookups.departments));
    this.load();
    // debounce عشان مانضربش الـ API مع كل حرف.
    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.service
      .list({
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize(),
        search: this.searchControl.value,
        departmentId: this.departmentFilter(),
        isActive: this.statusFilter(),
      })
      .subscribe({
        next: result => {
          this.rows.set(result.items);
          this.totalCount.set(result.totalCount);
          this.totalPages.set(result.totalPages);
          this.loading.set(false);
        },
        error: error => {
          this.errorMessage.set(extractErrorMessage(error, 'Could not load employees.'));
          this.loading.set(false);
        },
      });
  }

  /** أي بحث أو فلتر جديد بيرجّعنا لصفحة 1 — وإلا تفضل على صفحة 5 والنتيجة صفحتين. */
  applyFilters(): void {
    this.pageNumber.set(1);
    this.load();
  }

  onDepartmentFilter(value: string): void {
    this.departmentFilter.set(value ? +value : null);
    this.applyFilters();
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value === '' ? null : value === 'true');
    this.applyFilters();
  }

  clearFilters(): void {
    this.departmentFilter.set(null);
    this.statusFilter.set(null);
    this.searchControl.setValue('', { emitEvent: false });
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.pageNumber.set(page);
    this.load();
  }

  startCreate(): void {
    this.errorMessage.set('');
    this.form.reset({ employeeCode: '', fullName: '', email: '', phone: '', departmentId: 0 });
    this.form.controls.employeeCode.enable();
    this.editingId.set(0);
  }

  startEdit(row: EmployeeRow): void {
    this.errorMessage.set('');
    this.editingId.set(row.id);
    this.loadingForm.set(true);

    this.service.getById(row.id).subscribe({
      next: employee => {
        this.form.setValue({
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          email: employee.email ?? '',
          phone: employee.phone ?? '',
          departmentId: employee.departmentId,
        });
        this.form.controls.employeeCode.disable();
        this.loadingForm.set(false);
      },
      error: error => {
        this.loadingForm.set(false);
        this.editingId.set(null);
        this.errorMessage.set(extractErrorMessage(error, 'Could not open this employee.'));
      },
    });
  }

  closeForm(): void {
    this.editingId.set(null);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.editingId();
    if (id === null) return;

    const raw = this.form.getRawValue();
    const shared = {
      fullName: raw.fullName.trim(),
      email: raw.email.trim(),
      phone: raw.phone.trim(),
      departmentId: +raw.departmentId, 
    };

    const request =
      id === 0
        ? this.service.create({ employeeCode: raw.employeeCode.trim(), ...shared })
        : this.service.update(id, shared);

    this.saving.set(true);
    this.errorMessage.set('');

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.load();
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(extractErrorMessage(error, 'The changes could not be saved.'));
      },
    });
  }

  toggleStatus(row: EmployeeRow): void {
    const confirmed = row.isActive
      ? confirm(
          `Deactivate "${row.employeeName}"?\n\nThey disappear from the pickers on new assignments, but assets already assigned to them stay as they are.`
        )
      : confirm(`Activate "${row.employeeName}"?\n\nThey show up again in the pickers on new assignments.`);
    if (!confirmed) return;

    this.errorMessage.set('');

    this.service.setStatus(row.id, !row.isActive).subscribe({
      next: () => this.load(),
      error: error => this.errorMessage.set(extractErrorMessage(error, 'Could not change the status.')),
    });
  }
}