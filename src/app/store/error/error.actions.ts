import { createAction, props } from '@ngrx/store';
import { AppError } from '../../core/models/error.model';

export const addError = createAction(
  '[Error] Add Error',
  props<{ error: AppError }>()
);

export const removeError = createAction(
  '[Error] Remove Error',
  props<{ errorId: string }>()
);

export const clearAllErrors = createAction(
  '[Error] Clear All Errors'
);

export const clearErrorsByType = createAction(
  '[Error] Clear Errors By Type',
  props<{ errorType: AppError['type'] }>()
);

export const retryAction = createAction(
  '[Error] Retry Action',
  props<{ errorId: string; originalAction: any }>()
);