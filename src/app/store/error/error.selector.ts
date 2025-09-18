import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ErrorState } from '../../core/models/error.model';

export const selectErrorState = createFeatureSelector<ErrorState>('error');

export const selectAllErrors = createSelector(
  selectErrorState,
  (state) => state.errors
);

export const selectLastError = createSelector(
  selectErrorState,
  (state) => state.lastError
);

export const selectErrorsByType = (errorType: string) => createSelector(
  selectAllErrors,
  (errors) => errors.filter(error => error.type === errorType)
);

export const selectNetworkErrors = createSelector(
  selectAllErrors,
  (errors) => errors.filter(error => error.type === 'network')
);

export const selectApiErrors = createSelector(
  selectAllErrors,
  (errors) => errors.filter(error => error.type === 'api')
);

export const selectValidationErrors = createSelector(
  selectAllErrors,
  (errors) => errors.filter(error => error.type === 'validation')
);

export const selectRetryableErrors = createSelector(
  selectAllErrors,
  (errors) => errors.filter(error => error.retryable)
);

export const selectErrorById = (errorId: string) => createSelector(
  selectAllErrors,
  (errors) => errors.find(error => error.id === errorId)
);

export const selectHasErrors = createSelector(
  selectAllErrors,
  (errors) => errors.length > 0
);

export const selectErrorCount = createSelector(
  selectAllErrors,
  (errors) => errors.length
);