import { createAction, props } from '@ngrx/store';
import { AuthResponse } from '../../core/models';

export const loginSuccess = createAction('[Auth API] Login Success', props<{ authResponse: AuthResponse }>());
export const logout = createAction('[Auth] Logout');
export const silentRefreshSuccess = createAction('[Auth API] Silent Refresh Success', props<{ authResponse: AuthResponse }>());
