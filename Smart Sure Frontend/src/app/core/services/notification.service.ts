import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastMessage } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  toasts$: Observable<ToastMessage[]> = this.toastsSubject.asObservable();

  success(title: string, message: string, duration = 4000): void {
    this.addToast({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration = 6000): void {
    this.addToast({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration = 5000): void {
    this.addToast({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration = 4000): void {
    this.addToast({ type: 'info', title, message, duration });
  }

  dismiss(id: string): void {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter((t) => t.id !== id));
  }

  private addToast(toast: Omit<ToastMessage, 'id'>): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastMessage = { ...toast, id };
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, newToast]);

    if (toast.duration) {
      setTimeout(() => this.dismiss(id), toast.duration);
    }
  }
}
