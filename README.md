<div align="center">

# SmartSure

**Cloud-Ready Insurance Management Platform**

*Java 17 · Spring Boot 3 · Angular 17 · Microservices*

![Version](https://img.shields.io/badge/version-1.0-4a7080?style=flat-square)
![Status](https://img.shields.io/badge/status-Final%20Draft-6b8f9a?style=flat-square)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-17-DD0031?style=flat-square&logo=angular&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)

</div>

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Microservices](#microservices)
- [Frontend Architecture](#frontend-architecture)
- [Data Model](#data-model)
- [Inter-Service Communication](#inter-service-communication)
- [Security Architecture](#security-architecture)
- [Observability Stack](#observability-stack)
- [Infrastructure & Deployment](#infrastructure--deployment)
- [Feature Catalogue](#feature-catalogue)
- [User Flows](#user-flows)
- [Design Patterns](#design-patterns)
- [Non-Functional Characteristics](#non-functional-characteristics)
- [Getting Started](#getting-started)

---

## Overview

SmartSure is a full-stack, production-grade **Insurance Management Platform** built on a microservices architecture. It enables customers to browse insurance products, purchase and manage policies, pay premiums via an integrated payment gateway, and file claims — all through a responsive SPA frontend. Administrators have a dedicated control plane to manage the full policy and claim lifecycle, review audit trails, and oversee user accounts.

**Key capabilities at a glance:**

| Capability | Details |
|---|---|
| Policy Management | Browse, purchase, renew, and cancel policies |
| Premium Payments | Razorpay-integrated payment flow with SAGA orchestration |
| Claims Processing | Multi-stage claim lifecycle with file upload support |
| Admin Control | Full CRUD across policies, claims, policy types, and users |
| Audit Trail | Immutable logs for every policy and admin action |
| Notifications | Email and real-time WebSocket notifications |
| Observability | Distributed tracing, metrics, and code quality dashboards |

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser / SPA                      │
│           Angular 17 SPA  ·  :4200                  │
│    NgRx Store  |  Route Guards  |  JWT Interceptor   │
└────────────────────────┬────────────────────────────┘
                         │  HTTPS / REST
┌────────────────────────▼────────────────────────────┐
│              API Gateway  ·  :8080                   │
│        Spring Cloud Gateway  (Reactive WebFlux)      │
│   JWT Validation → X-User-Id / X-User-Role headers  │
│              CORS: localhost:4200                    │
└────────────────────────┬────────────────────────────┘
                         │  Eureka Service Discovery
┌────────────────────────▼────────────────────────────┐
│               Domain Microservices                   │
│  ┌──────┐ ┌────────┐ ┌───────┐ ┌─────────┐ ┌─────┐ │
│  │ Auth │ │ Policy │ │ Claim │ │ Payment │ │Admin│ │
│  │:8081 │ │ :8082  │ │ :8083 │ │  :8084  │ │:8085│ │
│  └──────┘ └────────┘ └───────┘ └─────────┘ └─────┘ │
└────────────────────────┬────────────────────────────┘
                         │  Shared Infrastructure
┌────────────────────────▼────────────────────────────┐
│                    Infrastructure                    │
│  MySQL:3306  │  Redis:6379  │  RabbitMQ:5672        │
│  Eureka:8761 │  Config:8888 │  Zipkin:9411          │
│  Prometheus:9090  │  Grafana:3000  │  SonarQube:9000 │
└─────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend

| Concern | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3 |
| API Gateway | Spring Cloud Gateway (Reactive WebFlux) |
| Service Discovery | Netflix Eureka |
| Centralised Config | Spring Cloud Config Server |
| Inter-Service (sync) | OpenFeign |
| Inter-Service (async) | RabbitMQ |
| Resilience | Resilience4j (Circuit Breaker, Rate Limiter) |
| Authentication | JWT (HMAC-SHA256) |
| ORM | Spring Data JPA / Hibernate |
| Database | MySQL 8 |
| Cache | Redis 7 |
| Payment Gateway | Razorpay |
| Distributed Tracing | Zipkin + Micrometer |
| Metrics | Prometheus + Grafana |
| Code Quality | SonarQube |
| Testing | JUnit 5 + Mockito |
| API Docs | Swagger / OpenAPI |

### Frontend

| Concern | Technology |
|---|---|
| Framework | Angular 17 (standalone components, signals) |
| State Management | NgRx (Store + Effects) |
| HTTP | Angular `HttpClient` with functional interceptors |
| Routing | Angular Router with lazy-loaded feature modules |
| Icons | Lucide Angular |
| Styling | SCSS |
| Real-Time | WebSocket (`NotificationSocketService`) |

---

## Microservices

| Service | Port | Responsibility | Database Schema |
|---|---|---|---|
| **Service Registry** | `8761` | Eureka discovery server | — |
| **Config Server** | `8888` | Spring Cloud Config (centralised configuration) | — |
| **API Gateway** | `8080` | JWT auth filter, CORS, routing | — |
| **Auth Service** | `8081` | Registration, login, user & address CRUD | `users`, `addresses` |
| **Policy Service** | `8082` | Policy type & policy management, premium scheduling | `policy_types`, `policies`, `premiums`, `audit_logs` |
| **Claim Service** | `8083` | Claim lifecycle, file uploads | `claims` |
| **Payment Service** | `8084` | Razorpay payment initiation & confirmation | `payments` |
| **Admin Service** | `8085` | Cross-service aggregation, admin audit logs | `audit_logs` |

### API Gateway Request Flow

```
Incoming Request
       │
       ▼
JWT Auth Filter (JwtAuthFilter)
       │  Invalid token → 401 Unauthorized
       │  Valid token   → Extract userId + role
       │                → Set X-User-Id, X-User-Role headers
       ▼
Route Matching (Eureka-registered services)
       │
       ▼
Downstream Microservice
```

**Public routes (no JWT required):**

```
POST /api/auth/**
GET  /api/policy-types/**
POST /api/policies/calculate-premium
     /swagger-ui/**
     /actuator/health
```

### Policy Service — State Machines

**Policy Status:**

```
CREATED → ACTIVE → EXPIRED        (auto, daily cron)
                 → CANCELLED      (customer / admin)
                 → DISCONTINUED   (admin only)
```

**Premium Status:**

```
PENDING → PAYMENT_IN_PROGRESS → PAID      (SAGA success)
                              → FAILED    (SAGA failure)
PENDING → OVERDUE    (daily cron)
        → WAIVED     (policy cancelled)
```

**Scheduled Jobs:**

| Cron Expression | Job |
|---|---|
| `0 0 1 * * *` | Auto-expire active policies past end date |
| `0 0 8 * * *` | Mark overdue premiums |
| `0 0 9 * * *` | Send premium due reminders (7 days ahead) |
| `0 5 9 * * *` | Send policy expiry reminders (30 days ahead) |

### Claim Service — State Machine

```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → CLOSED
                                 → REJECTED → CLOSED
```

Transitions are enforced at enum level via `Status.moveTo()`. Invalid transitions throw `InvalidStatusTransitionException`. Claim documents (Claim Form, Aadhaar Card, Evidence) are stored as `MEDIUMBLOB`.

### Payment Service — Flow

```
PENDING → SUCCESS  (Razorpay confirmed → SAGA triggered)
        → FAILED   (Razorpay declined → SAGA triggered)
SUCCESS → REFUNDED (future)
```

Payment methods supported: `CREDIT_CARD`, `DEBIT_CARD`, `NET_BANKING`, `UPI`, `WALLET`, `CHEQUE`. Razorpay Payment IDs are stored encrypted via a custom `EncryptionConverter`.

---

## Frontend Architecture

### Application Structure

```
src/app/
├── app.routes.ts            ← Root route table
├── app.config.ts            ← Angular standalone bootstrap
├── core/
│   ├── guards/              ← authGuard, roleGuard
│   ├── interceptors/        ← authInterceptor, errorInterceptor
│   ├── models/index.ts      ← All TypeScript DTOs (single source of truth)
│   └── services/            ← auth, policy, claim, payment, admin,
│                               user, policy-type, notification-socket
├── features/
│   ├── auth/                ← Login / Register (lazy)
│   ├── dashboard/           ← Customer dashboard (lazy, auth-guarded)
│   ├── policies/            ← Policy list, detail, purchase, renew
│   ├── claims/              ← Claim CRUD, file upload/download
│   ├── payments/            ← Razorpay integration flow
│   ├── policy-types/        ← Public catalog of insurance products
│   ├── profile/             ← Customer profile & address
│   └── admin/               ← Admin sub-module (role-guarded)
│       ├── admin-dashboard/
│       ├── admin-claims/
│       ├── admin-policy-types/
│       ├── admin-policies/
│       ├── admin-audit-logs/
│       └── admin-user-detail/
├── layouts/
│   └── main-layout/         ← Shell with navigation bar
└── store/
    └── auth/                ← NgRx reducer + effects for auth state
```

### Routing & Access Control

| Path | Guard | Allowed Roles |
|---|---|---|
| `/` or `/policy-types` | None | Public |
| `/auth/**` | None | Public |
| `/dashboard` | `authGuard` | CUSTOMER, ADMIN |
| `/policies/**` | `authGuard` | CUSTOMER, ADMIN |
| `/claims/**` | `authGuard` | CUSTOMER, ADMIN |
| `/payments/**` | `authGuard` | CUSTOMER, ADMIN |
| `/profile` | `authGuard` | CUSTOMER, ADMIN |
| `/admin/**` | `authGuard` + `roleGuard` | ADMIN only |

### Security on the Frontend

- **`authInterceptor`** — Attaches `Authorization: Bearer <token>` to every request (skips `/api/auth/**`). Triggers silent refresh if the token is expiring soon.
- **`authGuard`** — Checks `AuthService.isAuthenticated()` by comparing JWT `exp` against `Date.now()`. Redirects to login with `returnUrl`.
- **`roleGuard`** — Reads the decoded `role` claim from JWT. Redirects to `/dashboard` if unauthorised.
- **Token Storage** — JWT stored in `localStorage`; credentials for silent re-login in `sessionStorage` (base64, tab-scoped).
- **Silent Refresh** — Periodic `setInterval` monitor plus a per-request check; re-POSTs stored credentials to `/api/auth/login` for a fresh token.

### State Management

Only the **auth** slice is managed in the NgRx store. All other feature state is handled locally via Angular services and RxJS observables, keeping the global store minimal.

### Real-Time Notifications

`NotificationSocketService` wraps a native `WebSocket`, exposing an RxJS `Observable<AppNotification>` and an Angular Signal (`unreadCount`). It reconnects automatically after a 5-second back-off on disconnect.

---

## Data Model

### Auth Service

```sql
users
  id, email, password (BCrypt), role (CUSTOMER|ADMIN),
  firstName, lastName, phone, createdAt, updatedAt

addresses
  id, userId (FK→users), street_address, city, state, zip
```

### Policy Service

```sql
policy_types
  id, name (unique), description,
  category (HEALTH|AUTO|HOME|LIFE|TRAVEL|BUSINESS),
  basePremium, maxCoverageAmount, deductibleAmount, termMonths,
  minAge, maxAge, status (ACTIVE|INACTIVE|DISCONTINUED),
  coverageDetails (TEXT), createdAt, updatedAt

policies
  id, policyNumber (unique), customerId (→Auth.users.id),
  policy_type_id (FK), coverageAmount, premiumAmount,
  paymentFrequency, startDate, endDate, status,
  nomineeName, nomineeRelation, remarks, cancellationReason,
  createdAt, updatedAt

premiums
  id, policy_id (FK), amount, dueDate, paidDate, status,
  paymentReference, paymentMethod, razorpayOrderId

audit_logs
  id, policyId, actorId, actorRole, action,
  fromStatus, toStatus, details, createdAt
```

### Claim Service

```sql
claims
  id, policyId, customerId, status (State Machine enum),
  amount, incidentDate, incidentLocation, description,
  claimForm (MEDIUMBLOB + name + type),
  evidences (MEDIUMBLOB + name + type),
  aadhaarCard (MEDIUMBLOB + name + type),
  timeOfCreation
```

### Payment Service

```sql
payments
  id, policyId, premiumId, customerId, amount, status,
  paymentMethod, razorpayOrderId,
  razorpayPaymentId (encrypted), failureReason,
  createdAt, updatedAt
```

### Admin Service

```sql
audit_logs
  id, adminId, action, targetEntity, targetId,
  remarks, performedAt
```

---

## Inter-Service Communication

### Synchronous — OpenFeign

| Caller | Callee | Purpose |
|---|---|---|
| PolicyService | AuthService `/internal/users/{id}/profile` | Fetch customer name & email for notifications |
| PolicyService | PaymentService `/api/payments/initiate` | Initiate Razorpay order on premium pay |
| ClaimService | PolicyService | Validate policy existence before filing claim |
| AdminService | AuthService | Fetch user list & detail |
| AdminService | PolicyService | Fetch policies |
| AdminService | ClaimService | Fetch claims, approve/reject |

> **Resilience:** `@CircuitBreaker` + `@RateLimiter` (Resilience4j) are applied to the `policyPurchase` and `paymentService` circuit breakers in PolicyService. Fallback methods throw `ServiceUnavailableException`.

### Asynchronous — RabbitMQ

| Exchange | Type | Used By |
|---|---|---|
| `emailExchange` | Direct | AuthService (email sending) |
| `smartsure.exchange` | Topic | PolicyService ↔ PaymentService SAGA |

| Queue | Routing Key | Publisher | Consumer | Purpose |
|---|---|---|---|---|
| `emailQueue` | `emailRoutingKey` | Any service | AuthService `EmailConsumer` | Transactional emails |
| `payment.completed.queue` | `payment.completed` | PaymentService | PolicyService `PaymentSagaListener` | Mark premium PAID, notify |
| `payment.failed.queue` | `payment.failed` | PaymentService | PolicyService `PaymentSagaListener` | Mark premium FAILED |
| `notification.* queues` | various | PolicyService `NotificationPublisher` | AuthService / Notification | Policy events → email |

### SAGA Pattern — Premium Payment Flow

```
Customer         PolicyService       PaymentService        RabbitMQ
    │──payPremium──►│                      │                   │
    │               │──initiatePayment──►  │                   │
    │               │◄──{orderId, keyId}───│                   │
    │◄──{orderId}───│                      │                   │
    │                                      │                   │
    │──Razorpay UI confirm────────────────►│                   │
    │                                      │──publish           │
    │                                      │  payment.completed─►│
    │                                      │                   │──►PolicyService
    │                                      │                   │   PaymentSagaListener
    │                                      │                   │   → update premium PAID
    │                                      │                   │   → publish notification
```

---

## Security Architecture

### Authentication & Authorisation Flow

```
1. POST /api/auth/login
   │
   ▼ AuthService validates credentials (BCrypt)
   │
   ▼ JwtUtil.generateToken(userId, role)
     → sub  = userId (Long as String)
     → claim "role" = "CUSTOMER" | "ADMIN"
     → signed with HMAC-SHA256
   │
   ▼ Returns { token, email, role }

2. Subsequent Requests (via Angular authInterceptor)
   Authorization: Bearer <JWT>
   │
   ▼ API Gateway JwtAuthFilter
     → validates signature + expiry
     → extracts userId, role
     → sets X-User-Id, X-User-Role headers
     → forwards to downstream service
   │
   ▼ Downstream service reads headers
     (no repeated token parsing — trust the gateway)
```

### Secret & Credential Storage

| Secret | Location | Notes |
|---|---|---|
| JWT signing secret | Config Server / `.env` | HMAC-SHA256 key |
| JWT expiry | Config Server / `.env` | Configurable |
| MySQL password | Docker env / `.env` | Not hardcoded |
| RabbitMQ credentials | `guest/guest` | **Dev only** — rotate for production |
| Razorpay key/secret | Config Server | PaymentService |
| Redis | No auth in dev | Enable `requirepass` for production |

### Additional Security Measures

- **BCrypt** — All user passwords are stored as BCrypt hashes. The `PasswordEncoder` bean is declared in both AuthService and the API Gateway.
- **Admin Registration** — Admin accounts require a secret `adminCode` during registration. A default admin is seeded on startup via `AdminSeeder`.
- **Razorpay ID Encryption** — Payment IDs are encrypted at rest via a custom JPA `EncryptionConverter`.

---

## Observability Stack

| Tool | Port | Purpose |
|---|---|---|
| **Zipkin** | `9411` | Distributed tracing (Spring Cloud Sleuth / Micrometer) |
| **Prometheus** | `9090` | Metrics scraping from `/actuator/prometheus` |
| **Grafana** | `3000` | Dashboards built on top of Prometheus |
| **SonarQube** | `9000` | Static analysis and code quality gates |

Each microservice exposes `/actuator/health`, `/actuator/info`, and `/actuator/prometheus`. The API Gateway permits unauthenticated access to `/actuator/**`.

---

## Infrastructure & Deployment

### Docker Compose (Development)

```yaml
# Infrastructure services
mysql:8          → :3306   (volume: mysql-data)
redis:7          → :6379
rabbitmq:3-mgmt  → :5672 (AMQP), :15672 (Management UI)
zipkin:2.27      → :9411
prometheus       → :9090   (config: ./prometheus/prometheus.yml)
grafana:10.2.0   → :3000
sonarqube:lts    → :9000   (volumes: data, extensions, logs)
```

### Service Registry & Config Bootstrap

```
Config Server  (:8888)
  └── microservices bootstrap from here on startup
  └── reads from git or local config directory

Eureka Server  (:8761)
  └── all microservices register on start
  └── API Gateway resolves service names via Eureka
```

### Cloud Deployment Target

The platform is structured for container deployment on **Azure Container Apps** or **Azure Kubernetes Service (AKS)**:

- Each service is built into an independent Docker image
- Secrets managed via Azure Key Vault or environment variables
- MySQL → Azure Database for MySQL / Cloud SQL
- Redis → Azure Cache for Redis
- RabbitMQ → Azure Service Bus or self-managed container

---

## Feature Catalogue

### Customer Features

| Feature | Frontend Route | Backend Endpoint |
|---|---|---|
| Browse policy types | `/policy-types` | `GET /api/policy-types` |
| Calculate premium | Policy purchase form | `POST /api/policies/calculate-premium` |
| Purchase policy | `/policies/purchase` | `POST /api/policies/purchase` |
| View my policies | `/policies` | `GET /api/policies/my` |
| Cancel policy | Policy detail | `PUT /api/policies/{id}/cancel` |
| Renew policy | Policy detail | `POST /api/policies/renew` |
| Pay premium | `/payments` | `POST /api/payments/initiate` → Razorpay → `POST /api/payments/confirm` |
| File a claim | `/claims/new` | `POST /api/claims` |
| Upload claim documents | Claim detail | `POST /api/claims/{id}/upload/*` |
| Track claim status | `/claims` | `GET /api/claims/my-claims` |
| View profile | `/profile` | `GET /user/getInfo/{userId}` |
| Update address | `/profile` | `PUT /user/updateAddress/{userId}` |

### Admin Features

| Feature | Frontend Route | Backend Endpoint |
|---|---|---|
| Admin dashboard | `/admin/dashboard` | Aggregated from all services |
| View all claims | `/admin/claims` | `GET /api/admin/claims` |
| Review / Approve / Reject claims | `/admin/claims/:id` | `PUT /api/admin/claims/{id}/approve\|reject` |
| Manage policy types | `/admin/policy-types` | `POST/PUT/DELETE /api/policy-types` |
| View all policies | `/admin/policies` | `GET /api/admin/policies` |
| Cancel any policy | Admin policy view | `PUT /api/admin/policies/{id}/cancel` |
| View audit logs | `/admin/audit-logs` | `GET /api/admin/audit-logs` |
| View user detail | `/admin/users/:id` | `GET /api/admin/users/{id}` |

---

## User Flows

### Customer — Policy Purchase

```
Browse Policy Types (public)
    │
    ▼
Calculate Premium (enter age, coverage amount)
    │
    ▼
Register / Login
    │
    ▼
Complete Purchase Form (nominee, payment frequency, dates)
    │
    ▼
Pay Premium via Razorpay
    │
    ├── Success → Policy ACTIVE, confirmation email sent
    └── Failure → Premium marked FAILED, retry available
```

### Customer — Claim Filing

```
Select Active Policy
    │
    ▼
Create Claim (incident details, amount, date, location)
    │
    ▼
Upload Documents (Claim Form, Aadhaar, Evidence)
    │
    ▼
Submit Claim → Status: SUBMITTED
    │
    ▼
Admin Review → UNDER_REVIEW
    │
    ├── Approved → APPROVED → CLOSED
    └── Rejected → REJECTED → CLOSED
```

### Admin — Claim Lifecycle

```
Admin Dashboard (aggregated view)
    │
    ▼
Claims Queue (SUBMITTED)
    │
    ▼
Mark Under Review
    │
    ▼
Review Details + Documents
    │
    ├── Approve → notify customer, close claim
    └── Reject  → notify customer with reason, close claim
```

### Authentication Flow

```
User submits credentials
    │
    ▼
AuthService validates (BCrypt)
    │
    ▼
JWT issued (HS256, contains userId + role)
    │
    ▼
Angular stores JWT in localStorage
    │
    ├── Per-request: authInterceptor attaches Bearer token
    ├── Per-route:   authGuard / roleGuard validates claim
    └── Expiry:      silent refresh re-authenticates in background
```

---

## Design Patterns

| Pattern | Application |
|---|---|
| **Microservices** | Entire backend — 5 domain services + 2 infrastructure services |
| **API Gateway** | Single entry point; JWT validation; header injection |
| **Service Discovery** | Eureka for dynamic service registration and resolution |
| **Centralised Config** | Spring Cloud Config Server |
| **CQRS** | `UserCommandService` + `UserQueryService`; `PolicyCommandService` + `PolicyQueryService` |
| **SAGA (Choreography)** | Payment → PolicyService via RabbitMQ (`payment.completed`, `payment.failed`) |
| **Circuit Breaker** | Resilience4j on PolicyService → PaymentService Feign calls |
| **Rate Limiter** | Resilience4j on the policy purchase endpoint |
| **State Machine** | Claim `Status` enum with enforced `moveTo()` transitions |
| **Scheduled Jobs** | Spring `@Scheduled` — policy expiry, overdue premiums, due reminders |
| **Audit Trail** | Immutable `AuditLog` entities in PolicyService and AdminService |
| **Observability** | Zipkin (traces) + Prometheus + Grafana (metrics) + SonarQube (quality) |
| **Lazy Loading** | All Angular feature modules loaded on demand |
| **NgRx** | Auth state management (actions, reducers, effects) |
| **HTTP Interceptors** | JWT attachment + silent refresh + global error handling |

---

## Non-Functional Characteristics

| Attribute | Implementation |
|---|---|
| **Scalability** | Stateless services; Eureka-based load balancing; horizontal scaling ready |
| **Resilience** | Circuit breakers + rate limiters (Resilience4j); SAGA compensations on payment failure |
| **Security** | JWT HMAC-SHA256; BCrypt password hashing; gateway-level authentication; role-based authorisation |
| **Observability** | End-to-end distributed tracing (Zipkin); metrics collection and dashboarding (Prometheus + Grafana) |
| **Testability** | JUnit 5 + Mockito unit tests; Swagger UI for API exploration |
| **Maintainability** | SonarQube code quality gates; CQRS; clean separation of concerns per microservice |
| **Data Integrity** | `@Transactional` on all mutating operations; JPA cascade rules |
| **Auditability** | Immutable audit logs per policy action and per admin action |

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+ and npm
- Docker and Docker Compose
- Maven 3.9+

### 1. Start Infrastructure

```bash
docker-compose up -d
```

This starts MySQL, Redis, RabbitMQ, Zipkin, Prometheus, Grafana, and SonarQube.

### 2. Start Backend Services (order matters)

```bash
# 1. Config Server
cd config-server && mvn spring-boot:run

# 2. Service Registry
cd service-registry && mvn spring-boot:run

# 3. Domain services (in any order after the above)
cd auth-service    && mvn spring-boot:run
cd policy-service  && mvn spring-boot:run
cd claim-service   && mvn spring-boot:run
cd payment-service && mvn spring-boot:run
cd admin-service   && mvn spring-boot:run

# 4. API Gateway
cd api-gateway && mvn spring-boot:run
```

### 3. Start Frontend

```bash
cd frontend
npm install
ng serve
```

The application will be available at `http://localhost:4200`.

### Service URLs

| Service | URL |
|---|---|
| Angular SPA | http://localhost:4200 |
| API Gateway | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 |
| RabbitMQ Management | http://localhost:15672 |
| Zipkin | http://localhost:9411 |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| SonarQube | http://localhost:9000 |

### Environment Variables

Create a `.env` file at the root and configure:

```env
JWT_SECRET=<your-hmac-sha256-secret>
JWT_EXPIRY=86400000

MYSQL_ROOT_PASSWORD=<password>
MYSQL_DATABASE=smartsure

RAZORPAY_KEY_ID=<razorpay-key>
RAZORPAY_KEY_SECRET=<razorpay-secret>

ADMIN_CODE=<admin-registration-secret>
```

> **Production Note:** Rotate the default RabbitMQ credentials (`guest/guest`) and enable Redis `requirepass` before deploying to any non-development environment.

---

<div align="center">

**SmartSure** · High-Level Design v1.0 · 2026-05-12

*Prepared by Pragya Vijay*

</div>
