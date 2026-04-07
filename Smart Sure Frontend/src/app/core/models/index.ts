// ============================================================
// Auth Models
// ============================================================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'ADMIN';
  adminCode?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

export interface DecodedToken {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

// ============================================================
// User Models
// ============================================================
export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: number;
}

export interface UserResponse {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: number;
  role: string;
}

export interface AddressRequest {
  city: string;
  state: string;
  zip: number;
  street_address: string;
}

export interface AddressResponse {
  addressId: number;
  city: string;
  state: string;
  zip: number;
  street_address: string;
}

// ============================================================
// Policy Type Models
// ============================================================
export type InsuranceCategory = 'HEALTH' | 'AUTO' | 'HOME' | 'LIFE' | 'TRAVEL' | 'BUSINESS';
export type PolicyTypeStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';

export interface PolicyTypeRequest {
  name: string;
  description: string;
  category: InsuranceCategory;
  basePremium: number;
  maxCoverageAmount: number;
  deductibleAmount: number;
  termMonths: number;
  minAge?: number;
  maxAge?: number;
  coverageDetails?: string;
}

export interface PolicyTypeResponse {
  id: number;
  name: string;
  description: string;
  category: string;
  basePremium: number;
  maxCoverageAmount: number;
  deductibleAmount: number;
  termMonths: number;
  minAge: number;
  maxAge: number;
  status: string;
  coverageDetails: string;
  createdAt: string;
}

// ============================================================
// Policy Models
// ============================================================
export type PolicyStatus = 'CREATED' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'DISCONTINUED';
export type PaymentFrequency = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';

export interface PolicyPurchaseRequest {
  policyTypeId: number;
  coverageAmount: number;
  paymentFrequency: PaymentFrequency;
  startDate: string;
  nomineeName?: string;
  nomineeRelation?: string;
  customerAge?: number;
}

export interface PolicyRenewalRequest {
  policyId: number;
  newEndDate: string;
  newCoverageAmount?: number;
  paymentFrequency?: PaymentFrequency;
}

export interface PolicyStatusUpdateRequest {
  status: PolicyStatus;
  reason?: string;
}

export interface PolicyResponse {
  id: number;
  policyNumber: string;
  customerId: number;
  policyType: PolicyTypeResponse;
  coverageAmount: number;
  premiumAmount: number;
  paymentFrequency: string;
  startDate: string;
  endDate: string;
  status: string;
  nomineeName: string;
  nomineeRelation: string;
  remarks: string;
  cancellationReason: string;
  createdAt: string;
  premiums: PremiumResponse[];
}

export interface PolicyPageResponse {
  content: PolicyResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PolicySummaryResponse {
  totalPolicies: number;
  activePolicies: number;
  expiredPolicies: number;
  cancelledPolicies: number;
  totalPremiumCollected: number;
  totalCoverageProvided: number;
}

// ============================================================
// Premium Models
// ============================================================
export type PremiumStatus = 'PENDING' | 'PAYMENT_IN_PROGRESS' | 'PAID' | 'OVERDUE' | 'WAIVED';
export type PaymentMethodType = 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'UPI' | 'WALLET' | 'CHEQUE';

export interface PremiumPaymentRequest {
  policyId: number;
  premiumId: number;
  paymentMethod: PaymentMethodType;
  paymentReference?: string;
}

export interface PremiumResponse {
  id: number;
  amount: number;
  dueDate: string;
  paidDate: string;
  status: string;
  paymentReference: string;
  paymentMethod: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
}

export interface PremiumCalculationRequest {
  policyTypeId: number;
  coverageAmount: number;
  paymentFrequency: PaymentFrequency;
  customerAge?: number;
}

export interface PremiumCalculationResponse {
  basePremium: number;
  calculatedPremium: number;
  annualPremium: number;
  paymentFrequency: string;
  breakdown: string;
}

// ============================================================
// Claim Models
// ============================================================
export type ClaimStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CLOSED';

export interface ClaimRequest {
  policyId: number;
  amount: number;
  incidentDate: string;
  incidentLocation: string;
  description: string;
}

export interface ClaimResponse {
  id: number;
  policyId: number;
  amount: number;
  status: ClaimStatus;
  timeOfCreation: string;
  incidentDate?: string;
  incidentLocation?: string;
  description?: string;
  claimFormUploaded: boolean;
  aadhaarCardUploaded: boolean;
  evidencesUploaded: boolean;
}

export interface ClaimStatusUpdateRequest {
  status: string;
  remarks: string;
}

// ============================================================
// Payment Models
// ============================================================
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface PaymentRequest {
  policyId: number;
  premiumId: number;
  amount: number;
  paymentMethod: PaymentMethodType;
}

export interface ConfirmPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface FailPaymentRequest {
  razorpayOrderId: string;
}

export interface PaymentResponse {
  id: number;
  policyId: number;
  premiumId: number;
  customerId: number;
  amount: number;
  status: string;
  paymentMethod: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpayKeyId: string;
  createdAt: string;
}

// ============================================================
// Admin Models
// ============================================================
export interface AdminClaimDTO {
  id: number;
  policyId: number;
  amount: number;
  status: string;
  timeOfCreation: string;
  claimFormUploaded: boolean;
  aadhaarCardUploaded: boolean;
  evidencesUploaded: boolean;
}

export interface AdminPolicyDTO {
  id: number;
  policyNumber: string;
  customerId: number;
  policyType: PolicyTypeResponse;
  coverageAmount: number;
  premiumAmount: number;
  paymentFrequency: string;
  startDate: string;
  endDate: string;
  status: string;
  nomineeName: string;
  nomineeRelation: string;
  createdAt: string;
}

export interface AdminUserDTO {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: number;
  role: string;
}

export interface AuditLog {
  id: number;
  adminId: number;
  action: string;
  targetEntity: string;
  targetId: number;
  remarks: string;
  performedAt: string;
}

// ============================================================
// Pagination
// ============================================================
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ============================================================
// Notification
// ============================================================
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}
