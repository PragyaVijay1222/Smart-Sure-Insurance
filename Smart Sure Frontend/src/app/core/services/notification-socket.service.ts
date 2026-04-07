import { Injectable, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

/**
 * NotificationSocketService manages real-time updates via WebSockets.
 * Implements Guideline 13 for Real-Time Communication.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationSocketService {
  private socket: WebSocket | null = null;
  private notificationSubject = new Subject<AppNotification>();
  
  // Use Signal for UI-bound notification count (Guideline 6)
  unreadCount = signal(0);
  
  notifications$ = this.notificationSubject.asObservable();

  constructor() {
    // In a real production app, we would connect after login
    // this.connect(environment.wsUrl);
  }

  /**
   * Connect to the WebSocket server
   */
  connect(url: string): void {
    if (this.socket || !url) return;

    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleIncomingNotification(data);
    };

    this.socket.onclose = () => {
      console.warn('WebSocket connection closed. Attempting reconnect...');
      setTimeout(() => this.connect(url), 5000);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleIncomingNotification(data: any): void {
    const notification: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      type: data.type || 'info',
      title: data.title || 'New Update',
      message: data.message || '',
      timestamp: new Date(),
      read: false
    };

    this.notificationSubject.next(notification);
    this.unreadCount.update(count => count + 1);
  }

  markAllAsRead(): void {
    this.unreadCount.set(0);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
