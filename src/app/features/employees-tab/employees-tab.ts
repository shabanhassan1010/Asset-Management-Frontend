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
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/ToastService';
import { LanguageService } from '../../core/services/language.service';

import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LocalNamePipe } from '../../shared/pipes/local-name.pipe';
@Component({
  selector: 'app-employees-tab',
  imports: [ReactiveFormsModule, TranslatePipe, LocalNamePipe],
  templateUrl: './employees-tab.html',
})
export class EmployeesTab implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(EmployeeService);
  private lookupService = inject(LookupService);
  private destroyRef = inject(DestroyRef);
  private confirm = inject(ConfirmService);
  private language = inject(LanguageService);
  private toast = inject(ToastService);

  // Data
  rows = signal<EmployeeRow[]>([]);
  departments = signal<LookupItem[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  // Pagination
  pageNumber = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  totalPages = signal(0);

  // Filters
  departmentFilter = signal<number | null>(null);

  // Default: Active employees
  statusFilter = signal<boolean | null>(true);
  searchControl = new FormControl('', { nonNullable: true });

  // Form state
  editingId = signal<number | null>(null);
  saving = signal(false);
  loadingForm = signal(false);

  form = this.fb.nonNullable.group({
    // Always disabled: the server generates the code. A disabled control is skipped by
    // form.valid and form.value, so it needs no validators.
    employeeCode: [{ value: '', disabled: true }],
    fullName: ['', [Validators.required, Validators.maxLength(200)]],
    fullNameAr: ['', [Validators.maxLength(200)]],      // optional
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    phone: ['', [Validators.maxLength(30)]],
    departmentId: [0, [Validators.required, Validators.min(1)]],
  });

  activeDepartments = computed(() => this.departments().filter((d) => d.isActive));

  hasFilters = computed( () =>
      !!this.searchControl.value.trim() ||
      this.departmentFilter() !== null ||
      this.statusFilter() !== true,
  );

  ngOnInit(): void {
    this.lookupService.getAll()
                      .subscribe((lookups) => this.departments.set(lookups.departments));

    this.load();

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
        next: (result) => {
          if (result.items.length === 0 && this.pageNumber() > 1) {
          this.pageNumber.update((p) => p - 1);
          this.load();
          return;
        }
          this.rows.set(result.items);
          this.totalCount.set(result.totalCount);
          this.totalPages.set(result.totalPages);
          this.loading.set(false);
        },
        error: (error) => {
          // this.errorMessage.set(extractErrorMessage(error, 'Could not load employees.'));
          this.loading.set(false);
        },
      });
  }

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
    this.statusFilter.set(true);
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
    this.form.reset({ employeeCode: '', fullName: '', fullNameAr: '', email: '', phone: '', departmentId: 0 });
    this.editingId.set(0);

    // Show the code this employee will get. If the call fails the field just stays empty —
    // Save still works, because the server makes the code anyway.
    this.service.getNextCode().subscribe({
      next: (code) => {
        // The admin may have switched to "Edit" before the answer came back: don't overwrite that form.
        if (this.editingId() === 0) this.form.controls.employeeCode.setValue(code);
      },
      error: () => {},
    });
  }

  startEdit(row: EmployeeRow): void {
    this.errorMessage.set('');
    this.editingId.set(row.id);
    this.loadingForm.set(true);

    this.service.getById(row.id).subscribe({
      next: (employee) => {
        this.form.setValue({
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          fullNameAr: employee.fullNameAr ?? '',
          email: employee.email ?? '',
          phone: employee.phone ?? '',
          departmentId: employee.departmentId,
        });
        this.loadingForm.set(false);
      },
      error: (error) => {
        this.loadingForm.set(false);
        this.editingId.set(null);
        // this.errorMessage.set(extractErrorMessage(error, 'Could not open this employee.'));
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
      fullNameAr: raw.fullNameAr.trim() || null,    // empty → null, so the API stores NULL
      email: raw.email.trim(),
      phone: raw.phone.trim(),
      departmentId: +raw.departmentId,
    };

    const request =
      id === 0
        ? this.service.create(shared)   // no code: the server generates it
        : this.service.update(id, shared);

    this.saving.set(true);
    this.errorMessage.set('');

    request.subscribe({
      next: () => {
        this.saving.set(false);
        // Success toast here; error toasts come from errorInterceptor, so the error branch doesn't add one.
        // Same wording as the other lookup tabs. The name follows the site language (Arabic name when it exists).
        this.toast.success(
          this.language.t(id === 0 ? '"{name}" was added.' : '"{name}" was updated.',
                          { name: this.language.pick(shared.fullName, shared.fullNameAr) }),
        );
        this.closeForm();
        this.load();
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        // this.errorMessage.set(extractErrorMessage(error, 'The changes could not be saved.'));
      },
    });
  }

  async toggleStatus(row: EmployeeRow): Promise<void> {
    const confirmed = row.isActive
      ? await this.confirm.ask({
          title: 'Deactivate "{name}"?',
          params: { name: this.language.pick(row.employeeName, row.employeeNameAr) },
          message:
            'They disappear from the pickers on new assignments, but assets already assigned to them stay as they are.',
          confirmText: 'Deactivate',
          danger: true,
        })
      : await this.confirm.ask({
          title: 'Activate "{name}"?',
          params: { name: this.language.pick(row.employeeName, row.employeeNameAr) },
          message: 'They show up again in the pickers on new assignments.',
          confirmText: 'Activate',
        });

    if (!confirmed) return;

    this.errorMessage.set('');
    const newStatus = !row.isActive;

    this.service.setStatus(row.id, newStatus).subscribe({
    next: () => {
      this.toast.success(
        this.language.t(newStatus ? '"{name}" was activated.' : '"{name}" was deactivated.',
                        { name: this.language.pick(row.employeeName, row.employeeNameAr) }),
      );
      // Ask the server again so the current filter is applied.
      // This also updates totalCount and totalPages.
      this.load();
    },
    error: (error) => {
      this.errorMessage.set(extractErrorMessage(error, 'Could not change the status.'));
    },
  });
  }
}
