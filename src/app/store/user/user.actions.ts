import { createAction, props } from '@ngrx/store';

export const setEmail = createAction('[User] Set Email', props<{ email: string }>());
