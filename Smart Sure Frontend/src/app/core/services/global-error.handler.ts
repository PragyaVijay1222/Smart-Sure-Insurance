import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { NotificationService } from './notification.service';

/**
 * GlobalErrorHandler catches all unhandled exceptions at runtime.
 * Implements Guideline 5 for Error Handling & Resilience.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector, private zone: NgZone) {}

  handleError(error: any): void {
    // Need to use Injector manually to avoid circular dependencies with services
    const notificationService = this.injector.get(NotificationService);

    // Ensure notification runs inside the NgZone to avoid change detection issues
    this.zone.run(() => {
      // In a real-world app, we would send this to Sentry, LogRocket, or a custom ELK stack here.
      console.error('Global Error Caught:', error);

      const message = error.message || 'An unexpected application error occurred.';
      
      // Suppress missing icon errors from showing a toast to the user
      if (typeof message === 'string' && message.includes('Unable to resolve icon')) {
         return; // Silently drop it
      }

      notificationService.error(
        'Application Error',
        'A runtime error occurred. Please refresh the page if the issue persists.'
      );
    });
  }
}
