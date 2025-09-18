import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserModel } from '../../core/models/user.model';

const getuserstate = createFeatureSelector<UserModel>('user');

export const getUserEmail = createSelector(getuserstate, (state) => state?.email || null);
