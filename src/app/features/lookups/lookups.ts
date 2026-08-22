// src/app/features/lookups/lookups.ts
import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { extractErrorMessage } from '../../core/http-error';
import { LOOKUP_KINDS, LookupKindConfig, LookupRow } from '../../core/models/lookup-admin.model';
import { LookupAdminService } from '../../core/services/lookup-admin.service';
import { EmployeesTab } from '../employees-tab/employees-tab';

@Component({
  selector: 'app-lookups',
  imports: [ReactiveFormsModule, EmployeesTab],
  templateUrl: './lookups.html',
})
export class Lookups implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(LookupAdminService);

  kinds = LOOKUP_KINDS;
  activeKind = signal<LookupKindConfig>(LOOKUP_KINDS[0]);


  employeesTab = signal(false);
  private employeesTabRef = viewChild(EmployeesTab);

  rows = signal<LookupRow[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');

  editingId = signal<number | null>(null);
  saving = signal(false);

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

    this.service.list(this.activeKind()).subscribe({
      next: data => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: error => {
        this.errorMessage.set(extractErrorMessage(error, 'Could not load this list.'));
        this.loading.set(false);
      },
    });
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
    this.successMessage.set('');
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
        this.closeForm();
        this.load();
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(extractErrorMessage(error, 'The changes could not be saved.'));
      },
    });
  }

  deactivate(row: LookupRow): void {
    const config = this.activeKind();
    const confirmed = confirm(
      `Deactivate "${row.name}"?\n\nIt disappears from the pickers on new assets, but assets already using it keep working.`
    );
    if (!confirmed) return;

    this.service.deactivate(config, row.id).subscribe({
      next: () => this.load(),
      error: error => this.errorMessage.set(extractErrorMessage(error, 'Could not deactivate this row.')),
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
