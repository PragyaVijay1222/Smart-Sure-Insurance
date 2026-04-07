import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  PolicyTypeRequest,
  PolicyTypeResponse,
  InsuranceCategory,
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PolicyTypeService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/policy-types`;
  private activePolicyTypesCache$: Observable<PolicyTypeResponse[]> | null = null;

  constructor(private http: HttpClient) {}

  getActivePolicyTypes(forceRefresh = false): Observable<PolicyTypeResponse[]> {
    if (forceRefresh || !this.activePolicyTypesCache$) {
      this.activePolicyTypesCache$ = this.http.get<PolicyTypeResponse[]>(this.baseUrl).pipe(
        shareReplay(1),
        catchError(err => {
          this.activePolicyTypesCache$ = null; // Don't cache errors
          throw err;
        })
      );
    }
    return this.activePolicyTypesCache$;
  }

  refreshPolicyTypes(): void {
    this.activePolicyTypesCache$ = null;
  }

  getPolicyTypeById(id: number): Observable<PolicyTypeResponse> {
    return this.http.get<PolicyTypeResponse>(`${this.baseUrl}/${id}`);
  }

  getByCategory(category: InsuranceCategory): Observable<PolicyTypeResponse[]> {
    return this.http.get<PolicyTypeResponse[]>(`${this.baseUrl}/category/${category}`);
  }

  // Admin
  getAllPolicyTypes(): Observable<PolicyTypeResponse[]> {
    return this.http.get<PolicyTypeResponse[]>(`${this.baseUrl}/all`);
  }

  createPolicyType(request: PolicyTypeRequest): Observable<PolicyTypeResponse> {
    return this.http.post<PolicyTypeResponse>(this.baseUrl, request);
  }

  updatePolicyType(id: number, request: PolicyTypeRequest): Observable<PolicyTypeResponse> {
    return this.http.put<PolicyTypeResponse>(`${this.baseUrl}/${id}`, request);
  }

  deletePolicyType(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }
}
