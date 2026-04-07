import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col relative overflow-hidden bg-surface-50 dark:bg-gradient-to-br dark:from-surface-950 dark:via-surface-900 dark:to-primary-950 text-surface-900 dark:text-surface-50 transition-colors duration-500">
      <!-- Global Radial Glows (Lighter than Auth) - Dark Mode Only -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 dark:bg-primary-500/20 blur-[120px] hidden dark:block"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/5 dark:bg-accent-500/10 blur-[120px] hidden dark:block"></div>
      </div>

      <app-header />
      
      <main class="flex-1 relative z-10">
        <div class="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 py-8 h-full">
          <router-outlet />
        </div>
      </main>

      <app-footer />
    </div>
  `,
})
export class MainLayoutComponent {}
