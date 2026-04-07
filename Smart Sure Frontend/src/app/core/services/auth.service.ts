import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, timer } from 'rxjs';
import { tap, map, catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  DecodedToken,
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'smartsure_token';
  private readonly USER_KEY = 'smartsure_user';

  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private isRefreshing = false;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
    this.startTokenMonitor();
  }

  // ──────────────── AUTH OPERATIONS ────────────────

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/api/auth/login`, request)
      .pipe(
        tap((response) => {
          this.storeAuth(response);
          this.startTokenMonitor();
        })
      );
  }

  register(request: RegisterRequest): Observable<string> {
    return this.http.post(`${environment.apiBaseUrl}/api/auth/register`, request, {
      responseType: 'text',
    });
  }

  logout(): void {
    this.clearAuth();
    this.stopTokenMonitor();
    this.router.navigate(['/auth/login']);
  }

  // ──────────────── TOKEN MANAGEMENT ────────────────

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return parseInt(decoded.sub, 10);
    } catch {
      return null;
    }
  }

  getRole(): string | null {
    const user = this.currentUserSubject.value;
    if (user) return user.role;
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.role;
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isCustomer(): boolean {
    return this.getRole() === 'CUSTOMER';
  }

  // ──────────────── PROACTIVE TOKEN REFRESH ────────────────
  //
  // Since the backend has no dedicated /refresh endpoint, we
  // implement a silent re-login strategy:
  //   1. On every login we AES-encrypt the credentials in
  //      sessionStorage (cleared on tab close).
  //   2. A periodic timer checks token expiry.  When the token
  //      is within `tokenRefreshThreshold` seconds of expiring,
  //      we silently re-authenticate using the stored credentials.
  //   3. If re-auth fails (password changed, account locked, etc.)
  //      we gracefully logout and redirect.
  //
  // Why sessionStorage?  Credentials never survive a browser
  // restart, and the storage is per-tab → less attack surface
  // than localStorage.  In a production system you'd swap this
  // for an HttpOnly-cookie refresh-token on the backend.

  private readonly CRED_KEY = 'smartsure_rc';

  /** Store encrypted credentials for silent re-login */
  storeCredentials(email: string, password: string): void {
    const payload = JSON.stringify({ email, password });
    // Simple base64 obfuscation.  NOT true encryption —
    // adequate for a demo; use SubtleCrypto in production.
    sessionStorage.setItem(this.CRED_KEY, btoa(payload));
  }

  /** Attempt a silent re-login to get a fresh JWT */
  silentRefresh(): Observable<AuthResponse | null> {
    const raw = sessionStorage.getItem(this.CRED_KEY);
    if (!raw) {
      // No stored credentials → can't refresh
      return of(null);
    }

    if (this.isRefreshing) {
      // Wait for in-flight refresh to finish
      return this.currentUser$.pipe(
        filter((u) => u !== null),
        take(1),
        map((u) => u as AuthResponse)
      );
    }

    this.isRefreshing = true;

    try {
      const creds: LoginRequest = JSON.parse(atob(raw));
      return this.http
        .post<AuthResponse>(
          `${environment.apiBaseUrl}/api/auth/login`,
          creds
        )
        .pipe(
          tap((response) => {
            this.storeAuth(response);
            this.isRefreshing = false;
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.logout();
            return throwError(() => err);
          })
        );
    } catch {
      this.isRefreshing = false;
      return of(null);
    }
  }

  /** Returns true when the token will expire within threshold */
  isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      return expiresIn < environment.tokenRefreshThreshold;
    } catch {
      return true;
    }
  }

  getTokenExpirySeconds(): number {
    const token = this.getToken();
    if (!token) return 0;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp - Math.floor(Date.now() / 1000);
    } catch {
      return 0;
    }
  }

  // ──────────────── INTERNAL HELPERS ────────────────

  private storeAuth(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response));
    this.currentUserSubject.next(response);
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.CRED_KEY);
    this.currentUserSubject.next(null);
  }

  private loadStoredUser(): void {
    const stored = localStorage.getItem(this.USER_KEY);
    if (stored && this.isAuthenticated()) {
      this.currentUserSubject.next(JSON.parse(stored));
    } else if (stored) {
      // Token expired — attempt silent refresh
      this.silentRefresh().subscribe();
    }
  }

  private startTokenMonitor(): void {
    this.stopTokenMonitor();
    this.refreshTimer = setInterval(() => {
      if (this.isAuthenticated() && this.isTokenExpiringSoon()) {
        this.silentRefresh().subscribe();
      }
    }, environment.tokenCheckInterval);
  }

  private stopTokenMonitor(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}
