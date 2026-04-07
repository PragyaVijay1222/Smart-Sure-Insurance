import { createReducer, on } from '@ngrx/store';
import { loginSuccess, logout, silentRefreshSuccess } from './auth.actions';
import { AuthState } from '../state/app.state';

export const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,
  on(loginSuccess, (state, { authResponse }) => ({
    ...state,
    user: { email: authResponse.email, role: authResponse.role },
    token: authResponse.token,
    error: null
  })),
  on(silentRefreshSuccess, (state, { authResponse }) => ({
    ...state,
    user: { email: authResponse.email, role: authResponse.role },
    token: authResponse.token,
    error: null
  })),
  on(logout, (state) => ({
    ...state,
    user: null,
    token: null
  }))
);
