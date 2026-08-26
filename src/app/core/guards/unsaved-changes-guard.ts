// src/app/core/guards/unsaved-changes-guard.ts
import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate 
{
  canDeactivate(): boolean;
}


export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = component => component.canDeactivate();


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