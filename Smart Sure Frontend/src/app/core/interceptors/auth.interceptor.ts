import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, switchMap, of, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // Skip auth header for login/register
  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  const token = authService.getToken();

  if (!token) {
    return next(req);
  }

  // Check if token is about to expire and try silent refresh first
  if (authService.isTokenExpiringSoon() && !req.url.includes('/api/auth/login')) {
    return authService.silentRefresh().pipe(
      switchMap((refreshed) => {
        const freshToken = authService.getToken() || token;
        const cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${freshToken}` },
        });
        return next(cloned);
      }),
      catchError((err) => {
        // If refresh fails, try with existing token anyway
        const cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        });
        return next(cloned);
      })
    );
  }

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(cloned);
};
