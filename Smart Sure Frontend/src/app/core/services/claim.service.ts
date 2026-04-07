import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClaimRequest, ClaimResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/claims`;

  constructor(private http: HttpClient) {}

  createClaim(request: ClaimRequest): Observable<ClaimResponse> {
    return this.http.post<ClaimResponse>(this.baseUrl, request);
  }

  getClaimById(id: number): Observable<ClaimResponse> {
    return this.http.get<ClaimResponse>(`${this.baseUrl}/${id}`);
  }

  getAllClaims(): Observable<ClaimResponse[]> {
    return this.http.get<ClaimResponse[]>(this.baseUrl);
  }

  getPolicyForClaim(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/policy`);
  }

  getUnderReviewClaims(): Observable<ClaimResponse[]> {
    return this.http.get<ClaimResponse[]>(`${this.baseUrl}/under-review`);
  }

  getMyClaims(): Observable<ClaimResponse[]> {
    return this.http.get<ClaimResponse[]>(`${this.baseUrl}/my-claims`);
  }

  deleteClaim(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  submitClaim(id: number): Observable<ClaimResponse> {
    return this.http.put<ClaimResponse>(`${this.baseUrl}/${id}/submit`, null);
  }

  moveToStatus(id: number, status: string): Observable<ClaimResponse> {
    return this.http.put<ClaimResponse>(`${this.baseUrl}/${id}/status`, null, {
      params: { next: status },
    });
  }

  // File uploads
  uploadClaimForm(id: number, file: File): Observable<ClaimResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ClaimResponse>(`${this.baseUrl}/${id}/upload/claim-form`, formData);
  }

  uploadAadhaarCard(id: number, file: File): Observable<ClaimResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ClaimResponse>(`${this.baseUrl}/${id}/upload/aadhaar`, formData);
  }

  uploadEvidence(id: number, file: File): Observable<ClaimResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ClaimResponse>(`${this.baseUrl}/${id}/upload/evidence`, formData);
  }

  // File downloads
  downloadClaimForm(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download/claim-form`, { responseType: 'blob' });
  }

  downloadAadhaarCard(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download/aadhaar`, { responseType: 'blob' });
  }

  downloadEvidence(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download/evidence`, { responseType: 'blob' });
  }

  getAdminCustomerClaims(customerId: number): Observable<ClaimResponse[]> {
    return this.http.get<ClaimResponse[]>(`${this.baseUrl}/admin/customer/${customerId}`);
  }
}
