import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PolicyPurchaseRequest,
  PolicyRenewalRequest,
  PolicyStatusUpdateRequest,
  PolicyResponse,
  PolicyPageResponse,
  PolicySummaryResponse,
  PremiumPaymentRequest,
  PremiumResponse,
  PremiumCalculationRequest,
  PremiumCalculationResponse,
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/policies`;

  constructor(private http: HttpClient) { }

  // ──────────── Customer ────────────

  purchasePolicy(request: PolicyPurchaseRequest): Observable<PolicyResponse> {
    return this.http.post<PolicyResponse>(`${this.baseUrl}/purchase`, request);
  }

  getMyPolicies(
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Observable<PolicyPageResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('direction', direction);
    return this.http.get<PolicyPageResponse>(`${this.baseUrl}/my`, { params });
  }

  getPolicyById(policyId: number): Observable<PolicyResponse> {
    return this.http.get<PolicyResponse>(`${this.baseUrl}/${policyId}`);
  }

  cancelPolicy(policyId: number, reason?: string): Observable<PolicyResponse> {
    let params = new HttpParams();
    if (reason) params = params.set('reason', reason);
    return this.http.put<PolicyResponse>(`${this.baseUrl}/${policyId}/cancel`, null, { params });
  }

  renewPolicy(request: PolicyRenewalRequest): Observable<PolicyResponse> {
    return this.http.post<PolicyResponse>(`${this.baseUrl}/renew`, request);
  }

  // ──────────── Premium Payment ────────────

  payPremium(request: PremiumPaymentRequest): Observable<PremiumResponse> {
    return this.http.post<PremiumResponse>(`${this.baseUrl}/premiums/pay`, request);
  }

  getPremiums(policyId: number): Observable<PremiumResponse[]> {
    return this.http.get<PremiumResponse[]>(`${this.baseUrl}/${policyId}/premiums`);
  }

  // ──────────── Premium Calculation ────────────

  calculatePremium(request: PremiumCalculationRequest): Observable<PremiumCalculationResponse> {
    return this.http.post<PremiumCalculationResponse>(`${this.baseUrl}/calculate-premium`, request);
  }

  // ──────────── Admin ────────────

  getAllPolicies(
    page = 0,
    size = 20,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Observable<PolicyPageResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('direction', direction);
    return this.http.get<PolicyPageResponse>(`${this.baseUrl}/admin/all`, { params });
  }

  adminUpdateStatus(policyId: number, request: PolicyStatusUpdateRequest): Observable<PolicyResponse> {
    return this.http.put<PolicyResponse>(`${this.baseUrl}/admin/${policyId}/status`, request);
  }

  getPolicySummary(): Observable<PolicySummaryResponse> {
    return this.http.get<PolicySummaryResponse>(`${this.baseUrl}/admin/summary`);
  }

  getAdminCustomerPolicies(customerId: number): Observable<PolicyResponse[]> {
    return this.http.get<PolicyResponse[]>(`${this.baseUrl}/admin/customer/${customerId}`);
  }
}
