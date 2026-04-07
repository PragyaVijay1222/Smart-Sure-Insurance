import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, delay, timeout } from 'rxjs/operators';
import {
  UserRequest,
  UserResponse,
  AddressRequest,
  AddressResponse,
  PageResponse,
} from '../models';
import { environment } from '../../../environments/environment';

export interface PaymentPreference {
  method: 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'WALLET' | '';
  upiId?: string;
  cardLabel?: string;
  bankName?: string;
  walletName?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${environment.apiBaseUrl}/user`;
  private readonly PREF_KEY = 'smartsure_payment_pref';
  private profileCache = new Map<number, UserResponse>();

  constructor(private http: HttpClient) {}

  addInfo(request: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/addInfo`, request);
  }

  getInfo(userId: number): Observable<UserResponse> {
    if (this.profileCache.has(userId)) {
      // Force asynchronous emission to prevent synchronous signal conflict in OnPush components
      return of(this.profileCache.get(userId)!).pipe(delay(0));
    }
    return this.http.get<UserResponse>(`${this.baseUrl}/getInfo/${userId}`).pipe(
      timeout(12000), // Hard timeout to prevent UI from hanging indefinitely
      tap(user => this.profileCache.set(userId, user))
    );
  }

  updateInfo(userId: number, request: UserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.baseUrl}/update/${userId}`, request);
  }

  deleteUser(userId: number): Observable<UserResponse> {
    return this.http.delete<UserResponse>(`${this.baseUrl}/delete/${userId}`);
  }

  addAddress(userId: number, request: AddressRequest): Observable<AddressResponse> {
    return this.http.post<AddressResponse>(`${this.baseUrl}/addAddress/${userId}`, request);
  }

  getAddress(userId: number): Observable<AddressResponse> {
    return this.http.get<AddressResponse>(`${this.baseUrl}/getAddress/${userId}`);
  }

  updateAddress(userId: number, request: AddressRequest): Observable<AddressResponse> {
    return this.http.put<AddressResponse>(`${this.baseUrl}/updateAddress/${userId}`, request);
  }

  deleteAddress(userId: number): Observable<AddressResponse> {
    return this.http.delete<AddressResponse>(`${this.baseUrl}/deleteAddress/${userId}`);
  }

  getAllUsers(
    page = 0,
    size = 10,
    sortBy = 'id',
    direction = 'asc'
  ): Observable<PageResponse<UserResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('direction', direction);
    return this.http.get<PageResponse<UserResponse>>(`${this.baseUrl}/getAll`, { params });
  }

  // ──────────── Payment Preference (localStorage) ────────────

  getPaymentPreference(userId: number): PaymentPreference {
    try {
      const raw = localStorage.getItem(`${this.PREF_KEY}_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { method: '' };
  }

  savePaymentPreference(userId: number, pref: PaymentPreference): void {
    localStorage.setItem(`${this.PREF_KEY}_${userId}`, JSON.stringify(pref));
  }

  clearPaymentPreference(userId: number): void {
    localStorage.removeItem(`${this.PREF_KEY}_${userId}`);
  }
}

