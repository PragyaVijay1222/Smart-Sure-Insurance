import { ApplicationConfig, provideZoneChangeDetection, ErrorHandler, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import {
  provideLucideIcons,
  LucideCircleCheck,
  LucideCircleX,
  LucideTriangleAlert,
  LucideInfo,
  LucideX,
  LucideSun,
  LucideMoon,
  LucideUser,
  LucideLogOut,
  LucideMenu,
  LucideArrowLeft,
  LucideCircleAlert,
  LucideMail,
  LucidePhone,
  LucideClock,
  LucideUpload,
  LucideFileText,
  LucideShieldCheck,
  LucideCreditCard,
  LucideChevronRight,
  LucideShield,
  LucidePlus,
  LucideEdit,
  LucideTrash2,
  LucideRefreshCw,
  LucideActivity,
  LucideFileCheck,
  LucideShieldAlert,
  LucideHeartPulse,
  LucideCar,
  LucideHome,
  LucideHeart,
  LucidePlane,
  LucideBriefcase
} from '@lucide/angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { GlobalErrorHandler } from './core/services/global-error.handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideStore({ auth: authReducer }),
    provideEffects([AuthEffects]),
    provideLucideIcons(
      LucideCircleCheck,
      LucideCircleX,
      LucideTriangleAlert,
      LucideInfo,
      LucideX,
      LucideSun,
      LucideMoon,
      LucideUser,
      LucideLogOut,
      LucideMenu,
      LucideArrowLeft,
      LucideCircleAlert,
      LucideMail,
      LucidePhone,
      LucideClock,
      LucideUpload,
      LucideFileText,
      LucideShieldCheck,
      LucideCreditCard,
      LucideChevronRight,
      LucideShield,
      LucidePlus,
      LucideEdit,
      LucideTrash2,
      LucideRefreshCw,
      LucideActivity,
      LucideFileCheck,
      LucideShieldAlert,
      LucideHeartPulse,
      LucideCar,
      LucideHome,
      LucideHeart,
      LucidePlane,
      LucideBriefcase
    ),
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
