import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideDynamicIcon, LucideUser, LucideLogOut, LucideSun, LucideMoon, LucideMenu, LucideSearch, LucideShield, LucideFileText } from '@lucide/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideDynamicIcon
  ],
  template: `
    <header class="sticky top-0 z-40 w-full border-b border-surface-200/50 dark:border-white/5 bg-white/80 dark:bg-surface-950/20 backdrop-blur-xl transition-all duration-300">
      <div class="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16">
        <div class="flex h-24 items-center justify-between">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-3 group">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-500 group-hover:rotate-6">
              <span class="text-white font-bold text-base">SS</span>
            </div>
            <span class="text-2xl font-bold font-display bg-gradient-to-r from-surface-900 to-surface-600 dark:from-white dark:to-surface-400 bg-clip-text text-transparent group-hover:from-primary-500 group-hover:to-accent-500 dark:group-hover:from-primary-400 dark:group-hover:to-accent-400 transition-all duration-500">
              SmartSure
            </span>
          </a>

          <!-- Nav Links -->
          <nav class="hidden md:flex items-center gap-8">
            <a routerLink="/policy-types" routerLinkActive="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" class="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors">Insurance Plans</a>
            
            @if (isCustomer) {
              <a routerLink="/dashboard" routerLinkActive="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" class="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors">Dashboard</a>
              <a routerLink="/policies" routerLinkActive="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" class="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors">My Policies</a>
              <a routerLink="/claims" routerLinkActive="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" class="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors">Claims</a>
              <a routerLink="/payments" routerLinkActive="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" class="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors">Payments</a>
            }
            @if (isAdmin) {
              <a routerLink="/admin/dashboard" routerLinkActive="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" class="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors">Admin Dashboard</a>
              <a routerLink="/admin/policy-types" routerLinkActive="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" class="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors">Manage Products</a>
              <a routerLink="/admin/claims" routerLinkActive="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" class="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors">Manage Claims</a>
              <a routerLink="/admin/policies" routerLinkActive="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" class="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors">All Policies</a>
              <a routerLink="/admin/audit-logs" routerLinkActive="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" class="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors">Audit Logs</a>
            }
          </nav>

          <!-- Right -->
          <div class="flex items-center gap-8">
            <button (click)="toggleTheme()" class="p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors" title="Toggle theme">
              @if (isDark) { <svg lucideIcon="sun" [size]="20"></svg> } @else { <svg lucideIcon="moon" [size]="20"></svg> }
            </button>

            @if (isAuthenticated) {
              <div class="relative" (click)="menuOpen = !menuOpen">
                <button class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
                  <div class="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {{ userInitial }}
                  </div>
                  <span class="text-sm font-medium text-surface-700 dark:text-surface-300 hidden sm:block">{{ userEmail }}</span>
                </button>

                @if (menuOpen) {
                    <div class="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-surface-800 shadow-elevated border border-surface-200 dark:border-surface-700 py-2 animate-scale-in">
                      <a routerLink="/profile" class="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors" (click)="menuOpen = false">
                        <svg lucideIcon="user" [size]="18"></svg> Profile
                      </a>
                      <hr class="my-1 border-surface-200 dark:border-surface-700">
                      <button (click)="logout()" class="flex items-center gap-3 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/30 w-full text-left transition-colors">
                        <svg lucideIcon="log-out" [size]="18"></svg> Sign Out
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <a routerLink="/auth/login" class="px-4 py-2 text-sm font-semibold text-surface-700 dark:text-surface-300 hover:text-primary-600 transition-colors">Sign In</a>
                <a routerLink="/auth/register" class="px-4 py-2 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-lg shadow-primary-600/30">Get Started</a>
              }
  
              <!-- Mobile menu -->
              <button (click)="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <svg lucideIcon="menu" [size]="24"></svg>
              </button>
          </div>
        </div>

        @if (mobileMenuOpen) {
          <nav class="md:hidden pb-4 pt-2 border-t border-surface-200 dark:border-surface-700 animate-slide-down">
            <a routerLink="/policy-types" (click)="mobileMenuOpen=false" class="block px-4 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg">Insurance Plans</a>
            
            @if (isCustomer) {
              <a routerLink="/dashboard" (click)="mobileMenuOpen=false" class="block px-4 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg">Dashboard</a>
              <a routerLink="/policies" (click)="mobileMenuOpen=false" class="block px-4 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg">My Policies</a>
              <a routerLink="/claims" (click)="mobileMenuOpen=false" class="block px-4 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg">Claims</a>
              <a routerLink="/payments" (click)="mobileMenuOpen=false" class="block px-4 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg">Payments</a>
            }
            @if (isAdmin) {
              <a routerLink="/admin/dashboard" (click)="mobileMenuOpen=false" class="block px-4 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg">Admin Dashboard</a>
              <a routerLink="/admin/claims" (click)="mobileMenuOpen=false" class="block px-4 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg">Manage Claims</a>
            }
          </nav>
        }
      </div>
    </header>
  `,
})
export class HeaderComponent implements OnInit {
  menuOpen = false;
  mobileMenuOpen = false;
  isDark = false;
  isAuthenticated = false;
  isCustomer = false;
  isAdmin = false;
  userEmail = '';
  userInitial = 'U';

  readonly User = LucideUser;
  readonly LogOut = LucideLogOut;
  readonly Sun = LucideSun;
  readonly Moon = LucideMoon;
  readonly Menu = LucideMenu;

  constructor(private authService: AuthService) {
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.isDark = savedTheme === 'dark';
        if (this.isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        this.isDark = document.documentElement.classList.contains('dark');
      }
    } else {
      this.isDark = false;
    }
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: any) => {
      this.isAuthenticated = !!user || this.authService.isAuthenticated();
      this.isCustomer = this.authService.isCustomer();
      this.isAdmin = this.authService.isAdmin();
      this.userEmail = user ? user.email : (this.authService['currentUserSubject']?.value?.email ?? '');
      this.userInitial = this.userEmail ? this.userEmail.charAt(0).toUpperCase() : 'U';
    });
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('dark', this.isDark);
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }

  logout(): void {
    this.menuOpen = false;
    this.authService.logout();
  }
}
