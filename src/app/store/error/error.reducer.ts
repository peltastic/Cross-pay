import { createReducer, on } from '@ngrx/store';
import { ErrorState, initialErrorState } from '../../core/models/error.model';
import * as ErrorActions from './error.actions';

const MAX_ERRORS = 10;

export const errorReducer = createReducer(
  initialErrorState,
  
  on(ErrorActions.addError, (state, { error }) => ({
    ...state,
    errors: [error, ...state.errors.slice(0, MAX_ERRORS - 1)],
    lastError: error
  })),

  on(ErrorActions.removeError, (state, { errorId }) => ({
    ...state,
    errors: state.errors.filter(error => error.id !== errorId),
    lastError: state.errors.find(error => error.id !== errorId) || null
  })),

  on(ErrorActions.clearAllErrors, () => initialErrorState),

  on(ErrorActions.clearErrorsByType, (state, { errorType }) => ({
    ...state,
    errors: state.errors.filter(error => error.type !== errorType),
    lastError: state.errors.find(error => error.type !== errorType) || null
  }))
);