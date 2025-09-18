import { Action, createReducer, on } from '@ngrx/store';
import { initialState } from './user.state';
import { setEmail } from './user.actions';
import { UserModel } from '../../core/models/user.model';

const _userReducer = createReducer(
  initialState,
  on(setEmail, (state, { email }) => ({ ...state, email }))
);


export function userReducer(state: UserModel | undefined, action: Action) {
    return _userReducer(state, action);
}