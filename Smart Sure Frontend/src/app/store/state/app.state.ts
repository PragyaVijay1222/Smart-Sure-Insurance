export interface AppState {
  auth: AuthState;
  policies: PolicyState;
  claims: ClaimState;
}

export interface AuthState {
  user: any | null; // Define user type
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface PolicyState {
  policies: any[]; // Define policy type
  loading: boolean;
  error: string | null;
}

export interface ClaimState {
  claims: any[]; // Define claim type
  loading: boolean;
  error: string | null;
}
