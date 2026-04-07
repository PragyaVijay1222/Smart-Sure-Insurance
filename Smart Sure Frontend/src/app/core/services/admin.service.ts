import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminClaimDTO,
  AdminPolicyDTO,
  AdminUserDTO,
  AuditLog,
  ClaimStatusUpdateRequest,
} from '../models';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/admin`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAdminHeaders(): HttpHeaders {
    const adminId = this.authService.getUserId();
    return new HttpHeaders({ 'X-Admin-Id': String(adminId ?? 0) });
  }

  // ──────────── Claims ────────────

  getAllClaims(): Observable<AdminClaimDTO[]> {
    return this.http.get<AdminClaimDTO[]>(`${this.baseUrl}/claims`);
  }

  getUnderReviewClaims(): Observable<AdminClaimDTO[]> {
    return this.http.get<AdminClaimDTO[]>(`${this.baseUrl}/claims/under-review`);
  }

  getClaimById(claimId: number): Observable<AdminClaimDTO> {
    return this.http.get<AdminClaimDTO>(`${this.baseUrl}/claims/${claimId}`);
  }

  markUnderReview(claimId: number): Observable<AdminClaimDTO> {
    return this.http.put<AdminClaimDTO>(
      `${this.baseUrl}/claims/${claimId}/review`,
      null,
      { headers: this.getAdminHeaders() }
    );
  }

  approveClaim(claimId: number, remarks: string): Observable<AdminClaimDTO> {
    const body: ClaimStatusUpdateRequest = { status: 'APPROVED', remarks };
    return this.http.put<AdminClaimDTO>(
      `${this.baseUrl}/claims/${claimId}/approve`,
      body,
      { headers: this.getAdminHeaders() }
    );
  }

  rejectClaim(claimId: number, remarks: string): Observable<AdminClaimDTO> {
    const body: ClaimStatusUpdateRequest = { status: 'REJECTED', remarks };
    return this.http.put<AdminClaimDTO>(
      `${this.baseUrl}/claims/${claimId}/reject`,
      body,
      { headers: this.getAdminHeaders() }
    );
  }

  // ──────────── Policies ────────────

  getAllPolicies(): Observable<AdminPolicyDTO[]> {
    return this.http.get<AdminPolicyDTO[]>(`${this.baseUrl}/policies`);
  }

  getPolicyById(policyId: number): Observable<AdminPolicyDTO> {
    return this.http.get<AdminPolicyDTO>(`${this.baseUrl}/policies/${policyId}`);
  }

  cancelPolicy(policyId: number, reason?: string): Observable<AdminPolicyDTO> {
    return this.http.put<AdminPolicyDTO>(
      `${this.baseUrl}/policies/${policyId}/cancel`,
      null,
      {
        headers: this.getAdminHeaders(),
        params: reason ? { reason } : {},
      }
    );
  }

  // ──────────── Users ────────────

  getAllUsers(): Observable<AdminUserDTO[]> {
    return this.http.get<AdminUserDTO[]>(`${this.baseUrl}/users`);
  }

  getUserById(userId: number): Observable<AdminUserDTO> {
    return this.http.get<AdminUserDTO>(`${this.baseUrl}/users/${userId}`);
  }

  // ──────────── Audit Logs ────────────

  getAllAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.baseUrl}/audit-logs`);
  }

  getRecentActivity(limit = 10): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.baseUrl}/audit-logs/recent`, {
      params: { limit },
    });
  }

  getEntityHistory(entity: string, id: number): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.baseUrl}/audit-logs/${entity}/${id}`);
  }

  getAuditLogsByDateRange(from: string, to: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.baseUrl}/audit-logs/range`, {
      params: { from, to },
    });
  }
}
