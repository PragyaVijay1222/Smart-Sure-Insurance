import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ignore icon loading errors to prevent panicking the user
      if (req.url.includes('.svg') || req.url.includes('/icons/')) {
        return throwError(() => error);
      }

      let errorMessage = 'An unexpected error occurred';

      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check your connection.';
          notificationService.error('Connection Error', errorMessage);
          break;

        case 400:
          errorMessage = extractErrorMessage(error) || 'Invalid request. Please check your input.';
          notificationService.warning('Bad Request', errorMessage);
          break;

        case 401:
          errorMessage = 'Your session has expired. Please log in again.';
          notificationService.warning('Session Expired', errorMessage);
          authService.logout();
          break;

        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          notificationService.error('Access Denied', errorMessage);
          router.navigate(['/dashboard']);
          break;

        case 404:
          errorMessage = extractErrorMessage(error) || 'The requested resource was not found.';
          notificationService.warning('Not Found', errorMessage);
          break;

        case 409:
          errorMessage = extractErrorMessage(error) || 'A conflict occurred. Please try again.';
          notificationService.warning('Conflict', errorMessage);
          break;

        case 500:
          errorMessage = 'A server error occurred. Please try again later.';
          notificationService.error('Server Error', errorMessage);
          break;

        case 503:
          errorMessage = 'The service is currently unavailable. Please try again later.';
          notificationService.error('Service Unavailable', errorMessage);
          break;

        default:
          notificationService.error('Error', errorMessage);
          break;
      }

      return throwError(() => error);
    })
  );
};

function extractErrorMessage(error: HttpErrorResponse): string {
  if (typeof error.error === 'string') {
    return error.error;
  }
  if (error.error?.message) {
    return error.error.message;
  }
  if (error.error?.error) {
    return error.error.error;
  }
  return error.message;
}
