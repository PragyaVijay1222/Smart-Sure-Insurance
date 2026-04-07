# Smart Sure Insurance - Frontend

A production-grade, feature-based **Angular 19** insurance platform. Built with a focus on performance, security, and scalability following industry standards.

---

## 🚀 Key Features

- **Futuristic UI**: Modern design using Tailwind CSS with glassmorphism and smooth animations.
- **Micro-Frontend Architecture**: Feature-based module structure for easy scaling.
- **Robust State Management**: Hybrid architecture using **NgRx** (Auth/Global) and **Angular Signals** (Local/Feature).
- **High Performance**: Optimized with `ChangeDetectionStrategy.OnPush` and strict `trackBy` implementations.
- **Resilient API Layer**: Centralized HttpClient services with Interceptors for JWT auth, silent refresh, and global error handling.
- **Real-Time Ready**: Built-in `NotificationSocketService` for WebSocket integration.
- **Payment Secure**: Deep integration with **Razorpay** for reliable policy purchases.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Angular 19.1.0 |
| **State** | NgRx 19.x, Signals (Angular 16+) |
| **Styling** | Tailwind CSS 4.x |
| **Icons** | Lucide Angular |
| **Forms** | Reactive Forms (Strictly Typed) |
| **Router** | Component-based Lazy Loading |

---

## 📂 Project Structure

```text
src/app/
├── core/             # Singleton services, interceptors, guards
│   ├── interceptors/ # Auth & Error global handling
│   ├── services/     # Centralized API logic & Global ErrorHandler
│   └── models/       # Shared TypeScript interfaces
├── shared/           # Reusable UI components & pipes
├── features/         # Business modules (Lazy Loaded)
│   ├── auth/         # Login & Register flows
│   ├── dashboard/    # Customer & Admin views
│   ├── policies/     # Purchasing & Product listings
│   └── claims/       # Submission & Approval workflows
└── store/            # NgRx Gloal State (Auth, UI)
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Angular CLI (`npm install -g @angular/cli`)

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment:
   Update `src/environments/environment.ts` with your API Gateway and Razorpay keys.

3. Run Development Server:
   ```bash
   ng serve --open
   ```

---

## 🛡️ Guidelines & Standards

This project strictly follows the **Frontend Implementation & Evaluation Guidelines**:
- **Architecture**: Modular and well-structured feature folders.
- **Security**: JWT-based auth with Http Interceptors and Route Guards.
- **Performance**: Lazy loading, OnPush, and Signal-based reactivity.
- **UX**: Smooth feedback loops with Toast notifications and loading states.
- **Resilience**: GlobalErrorHandler for unhandled runtime exceptions.

---

## 🧪 Testing

Run unit tests with Karma:
```bash
ng test
```

---

## 🏗️ Build

Build for production:
```bash
ng build --configuration production
```

---

## 📄 License
Internal Smart Sure Corporate License.
