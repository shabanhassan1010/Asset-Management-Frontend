import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { extractErrorMessage } from '../../core/http-error';
import { LOOKUP_KINDS, LookupKindConfig, LookupRow } from '../../core/models/lookup-admin.model';
import { LookupAdminService } from '../../core/services/lookup-admin.service';
import { EmployeesTab } from '../employees-tab/employees-tab';
import { ToastService } from '../../core/services/ToastService';
import { ConfirmService } from '../../core/services/confirm.service';

type StatusFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-lookups',
  imports: [ReactiveFormsModule, EmployeesTab],
  templateUrl: './lookups.html',
})
export class Lookups implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(LookupAdminService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  kinds = LOOKUP_KINDS;
  activeKind = signal<LookupKindConfig>(LOOKUP_KINDS[0]);

  employeesTab = signal(false);
  private employeesTabRef = viewChild(EmployeesTab);

  rows = signal<LookupRow[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  editingId = signal<number | null>(null);
  saving = signal(false);

  // Paging, search and filter
  readonly pageSize = 10;
  private readonly defaultStatus: StatusFilter = 'active';
  private searchTimer?: ReturnType<typeof setTimeout>;

  page = signal(1);
  totalCount = signal(0);
  totalPages = signal(1);
  search = signal('');
  statusFilter = signal<StatusFilter>('active');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    secondary: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  selectKind(config: LookupKindConfig): void {
    this.employeesTab.set(false);
    this.activeKind.set(config);
    this.page.set(1);
    this.search.set('');
    this.statusFilter.set(this.defaultStatus);
    this.closeForm();
    this.load();
  }

  selectEmployees(): void {
    this.employeesTab.set(true);
    this.closeForm();
    this.errorMessage.set('');
  }

  startNew(): void {
    if (this.employeesTab()) {
      this.employeesTabRef()?.startCreate();
    } else {
      this.startCreate();
    }
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const status = this.statusFilter();
    const isActive = status === 'all' ? null : status === 'active';

    this.service.listPaged(this.activeKind(), this.page(), this.pageSize, this.search().trim(), isActive)
      .subscribe({
        next: result => {
          this.rows.set(result.items);
          this.totalCount.set(result.totalCount);
          this.totalPages.set(Math.max(1, result.totalPages));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.load();
  }

  // Runs the search 300 ms after the user stops typing, not on every key
  onSearchInput(value: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.search.set(value);
      this.page.set(1);
      this.load();
    }, 300);
  }

  setStatusFilter(value: string): void {
    this.statusFilter.set(value as StatusFilter);
    this.page.set(1);
    this.load();
  }

  isFiltering(): boolean {
    return this.search().trim() !== '' || this.statusFilter() !== this.defaultStatus;
  }

  startCreate(): void {
    this.form.reset({ name: '', secondary: '' });
    this.applySecondaryValidator();
    this.editingId.set(0);
  }

  startEdit(row: LookupRow): void {
    this.form.setValue({ name: row.name, secondary: row.secondary ?? '' });
    this.applySecondaryValidator();
    this.editingId.set(row.id);
  }

  closeForm(): void {
    this.editingId.set(null);
  }

  private applySecondaryValidator(): void {
    const control = this.form.controls.secondary;
    control.setValidators(this.activeKind().secondaryRequired ? [Validators.required] : []);
    control.updateValueAndValidity();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.editingId();
    if (id === null) return;

    const config = this.activeKind();
    const { name, secondary } = this.form.getRawValue();
    const request = id === 0
      ? this.service.create(config, name.trim(), secondary.trim() || null)
      : this.service.update(config, id, name.trim(), secondary.trim() || null);

    this.saving.set(true);
    this.errorMessage.set('');

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(`"${name.trim()}" was ${id === 0 ? 'added' : 'updated'}.`);
        this.closeForm();
        this.load();
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(extractErrorMessage(error, 'The changes could not be saved.'));
      },
    });
  }

  async deactivate(row: LookupRow): Promise<void> {
    const config = this.activeKind();

    const confirmed = await this.confirm.ask({
      title: `Deactivate "${row.name}"?`,
      message: 'It disappears from the pickers on new assets, but assets already using it keep working.',
      confirmText: 'Deactivate',
      danger: true
    });
    if (!confirmed) return;

    this.service.deactivate(config, row.id).subscribe({
      next: () => {
        this.toast.success(`"${row.name}" was deactivated.`);

        // The last row on a page (not the first) disappears under the "Active" filter → go back one page
        if (this.rows().length === 1 && this.page() > 1 && this.statusFilter() === 'active') {
          this.page.update(p => p - 1);
        }
        this.load();
      },
    });
  }

  usageLabel(row: LookupRow): string {
    const parts: string[] = [];
    parts.push(`${row.assetsCount} asset${row.assetsCount === 1 ? '' : 's'}`);
    if (row.employeesCount !== null) {
      parts.push(`${row.employeesCount} employee${row.employeesCount === 1 ? '' : 's'}`);
    }
    return row.assetsCount === 0 && !row.employeesCount ? 'Not used yet' : parts.join(' · ');
  }
}