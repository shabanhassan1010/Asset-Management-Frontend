// src/app/features/users/users.ts
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Auth } from '../../core/services/auth';
import { extractErrorMessage } from '../../core/http-error';
import { UserRole } from '../../core/models/auth.model';
import { UserService } from '../../core/services/user.service';
import { LookupItem } from '../../core/models/Lookup.model';
import {
  UserListItem,
  UserFilters,
  AvailableEmployee,
  DEFAULT_USER_FILTERS,
} from '../../core/models/user.model';
import { LookupService } from '../../core/services/LookupService';
import { ToastService } from '../../core/services/ToastService';

@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './users.html',
})
export class Users implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private lookupService = inject(LookupService);
  private auth = inject(Auth);
  private toast = inject(ToastService);

  users = signal<UserListItem[]>([]);
  totalCount = signal(0);
  loading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');
  employeesLoadFailed = signal(false);
  filters = signal<UserFilters>({ ...DEFAULT_USER_FILTERS });
  showCreateForm = signal(false);
  creating = signal(false);

  // Departments come from the cached LookupService — the same source used by the other
  // screens, so there is no additional API call.
  departments = signal<LookupItem[]>([]);

  // Employees available for the currently selected department. Cleared whenever the department changes.
  availableEmployees = signal<AvailableEmployee[]>([]);
  loadingEmployees = signal(false);

  // The row currently being updated — so we disable only its buttons, not the entire table.
  busyUserId = signal<string | null>(null);

  roles = [
    { id: UserRole.Admin, name: 'Admin' },
    { id: UserRole.User, name: 'User' },
  ];

  private currentUserId = computed(() => this.auth.currentUser()?.userId ?? '');

  lastPage = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.filters().pageSize)));

  form = this.fb.nonNullable.group({
    userName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(256),
        // Same rule as the backend validator — so the user knows
        // about the error before submitting, instead of getting a 400 response.
        Validators.pattern(/^[a-zA-Z0-9._-]+$/),
      ],
    ],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
    role: [UserRole.User.toString(), Validators.required],
    // UI-only field: filters the employees and is not sent to the server.
    departmentId: ['', Validators.required],
    // Required: every account must be associated with an employee.
    employeeId: ['', Validators.required],
  });

  ngOnInit(): void {
    this.load();
    this.lookupService.getAll().subscribe((lookups) => this.departments.set(lookups.departments));
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.userService.getUsers(this.filters()).subscribe({
      next: (result) => {
        this.users.set(result.items);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractErrorMessage(error, 'Could not load users.'));
        this.loading.set(false);
      },
    });
  }

  patchFilters(changes: Partial<UserFilters>): void {
    this.filters.update((current) => ({ ...current, ...changes, pageNumber: 1 }));
    this.load();
  }

  goToPage(page: number): void {
    this.filters.update((current) => ({ ...current, pageNumber: page }));
    this.load();
  }

  /** The admin should not be able to change their own role or disable their own account — same backend rules. */
  isSelf(user: UserListItem): boolean {
    return user.userId === this.currentUserId();
  }

  roleLabel(role: UserRole): string {
    return role === UserRole.Admin ? 'Admin' : 'User';
  }

  changeRole(user: UserListItem, value: string): void {
    const role = +value as UserRole;
    if (role === user.role) return;

    this.busyUserId.set(user.userId);
    this.errorMessage.set('');

    this.userService.changeRole(user.userId, role).subscribe({
      next: () => {
        this.busyUserId.set(null);
        this.successMessage.set(`${user.userName} is now ${this.roleLabel(role)}.`);
        this.load();
      },
      error: (error: HttpErrorResponse) => {
        this.busyUserId.set(null);
        this.errorMessage.set(extractErrorMessage(error, 'The role could not be changed.'));
        this.load(); // Reloading so the dropdown returns to its actual value.
      },
    });
  }

  toggleStatus(user: UserListItem): void {
    const next = !user.isActive;

    if (!next) {
      const confirmed = confirm(
        `Disable ${user.userName}?\n\nTheir sessions end immediately and they cannot sign in again until re-enabled.`,
      );
      if (!confirmed) return;
    }

    this.busyUserId.set(user.userId);
    this.errorMessage.set('');

    this.userService.changeStatus(user.userId, next).subscribe({
      next: () => {
        this.busyUserId.set(null);
        const message = next ? 'enabled' : 'disabled';
        this.toast.success(`${user.userName} was ${message}.`);
        this.successMessage.set(`${user.userName} was ${message}.`);
        this.load();
      },
      error: (error: HttpErrorResponse) => {
        this.busyUserId.set(null);
        this.errorMessage.set(extractErrorMessage(error, 'The status could not be changed.'));
      },
    });
  }

  openCreateForm(): void {
    this.form.reset({
      userName: '',
      email: '',
      password: '',
      role: UserRole.User.toString(),
      departmentId: '',
      employeeId: '',
    });

    // The form opens with no department selected, so the employee field remains disabled
    // until a department is selected and employees are actually returned.
    this.availableEmployees.set([]);
    this.form.controls.employeeId.disable();
    this.showCreateForm.set(true);
  }

  onDepartmentChange(value: string): void {
    // We clear the previously selected employee first. Without this, if the admin changes the department
    // after selecting an employee, the old ID would remain in the form and be sent to the server.
    this.form.controls.employeeId.setValue('');
    this.availableEmployees.set([]);
    this.form.controls.employeeId.disable();
    this.employeesLoadFailed.set(false);
    const departmentId = +value;
    if (!departmentId) return;

    this.loadingEmployees.set(true);
    this.errorMessage.set('');

    this.userService.getAvailableEmployees(departmentId).subscribe({
      next: (employees) => {
        this.availableEmployees.set(employees);
        this.loadingEmployees.set(false);

        // We enable it only if there is an available employee — the department
        // remains disabled with a message if all of its employees already have accounts.
        if (employees.length > 0) this.form.controls.employeeId.enable();
      },
      error: (error: HttpErrorResponse) => {
        this.loadingEmployees.set(false);
        this.employeesLoadFailed.set(true);
        this.errorMessage.set(extractErrorMessage(error, 'Could not load employees.'));
      },
    });
  }

  createUser(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.creating.set(true);
    this.errorMessage.set('');

    // getRawValue also reads disabled fields — important here because employeeId may
    // still be disabled in certain cases.
    const v = this.form.getRawValue();

    this.userService
      .create({
        userName: v.userName.trim(),
        email: v.email.trim(),
        password: v.password,
        role: +v.role as UserRole,
        // departmentId exists in v but is not set here: the department is not part of the account data;
        // it is only used as a filtering mechanism.
        employeeId: +v.employeeId,
      })
      .subscribe({
        next: (created) => {
          this.creating.set(false);
          this.showCreateForm.set(false);
          const message = `${created.userName} was created.`;
          this.toast.success(message);
          this.successMessage.set(message);
          this.load();
        },
        error: (error: HttpErrorResponse) => {
          this.creating.set(false);

          // 409 = The name or email is already taken, or the employee got an account
          // while the form was open. The message returned by the server identifies the reason.
          this.errorMessage.set(extractErrorMessage(error, 'The user could not be created.'));
        },
      });
  }
}
