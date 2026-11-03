// src/app/core/guards/unsaved-changes-guard.ts
import { CanDeactivateFn } from '@angular/router';
import { ConfirmService } from '../services/confirm.service';
import { inject } from '@angular/core';

export interface HasUnsavedChanges 
{
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = component => 
{
  if (!component.hasUnsavedChanges()) return true;

  return inject(ConfirmService).ask({
    title: 'Leave without saving?',
    message: 'You have unsaved changes. If you leave now, they will be lost.',
    confirmText: 'Leave',
    cancelText: 'Stay',
    danger: true
  });
};


/*
                                                              Edit,Create Form
                                                                    ↓
                                                             User changes data
                                                                    ↓
                                                          User clicks another page
                                                                    ↓
                                                            unsavedChangesGuard
                                                                    ↓
                                                               "Are you sure?"
 */