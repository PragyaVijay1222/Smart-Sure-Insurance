import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PolicyTypeService } from '../../../core/services/policy-type.service';
import { AuthService } from '../../../core/services/auth.service';
import { PolicyTypeResponse, InsuranceCategory } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideDynamicIcon, LucideHeartPulse, LucideCar, LucideHome, LucideHeart, LucidePlane, LucideBriefcase, LucideFileText } from '@lucide/angular';

@Component({
  selector: 'app-policy-type-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent, LucideDynamicIcon],
  template: `
    <div class="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 py-8 animate-fade-in">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold font-display text-surface-900 dark:text-white">Insurance Plans</h1>
        <p class="text-surface-500 dark:text-surface-400 mt-2 max-w-xl mx-auto">Choose from our range of comprehensive insurance products designed to protect what matters most.</p>
      </div>

      <!-- Category Filter -->
      <div class="flex flex-wrap items-center justify-center gap-2 mb-8">
        <button (click)="selectedCategory = ''" class="px-4 py-2 rounded-full text-sm font-medium transition-all" [ngClass]="!selectedCategory ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'">
          All Plans
        </button>
        @for (cat of categories; track cat) {
          <button (click)="selectedCategory = cat" class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all" [ngClass]="selectedCategory === cat ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'">
            <svg [lucideIcon]="getCategoryIcon(cat)" [size]="16"></svg> {{ cat }}
          </button>
        }
      </div>

      @if (loading) {
        <app-loading-spinner />
      } @else if (errorMessage) {
        <div class="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-2xl p-12 text-center flex flex-col items-center max-w-2xl mx-auto mt-12">
          <div class="w-16 h-16 bg-danger-100 dark:bg-danger-800 rounded-full flex items-center justify-center mb-4 text-danger-500">
            <svg lucideIcon="circle-alert" [size]="32"></svg>
          </div>
          <h2 class="text-xl font-bold text-surface-900 dark:text-white mb-2">Oops! Something went wrong</h2>
          <p class="text-surface-500 dark:text-surface-400 mb-6 max-w-md">{{ errorMessage }}</p>
          <button (click)="loadData(true)" class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2">
            <svg lucideIcon="heart-pulse" [size]="18" class="animate-pulse"></svg>
            Retry Connection
          </button>
        </div>
      } @else if (filteredTypes.length === 0) {
        <div class="bg-surface-50 dark:bg-surface-800/50 border border-dashed border-surface-300 dark:border-surface-700 rounded-3xl p-12 text-center flex flex-col items-center max-w-2xl mx-auto mt-12">
          <div class="w-16 h-16 bg-surface-200 dark:bg-surface-700 rounded-full flex items-center justify-center mb-4 text-surface-400">
            <svg lucideIcon="file-text" [size]="32"></svg>
          </div>
          <h2 class="text-xl font-bold text-surface-900 dark:text-white mb-2">No plans found</h2>
          <p class="text-surface-500 dark:text-surface-400 mb-6 max-w-md">We couldn't find any plans matching your selection.</p>
          <button (click)="selectedCategory = ''" class="text-primary-500 font-bold hover:underline">View all plans</button>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (type of filteredTypes; track type.id) {
            <div class="group relative rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 overflow-hidden hover:shadow-card-hover hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300">
              <div class="h-2 bg-gradient-to-r from-primary-500 to-primary-600"></div>
              <div class="p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                    <svg [lucideIcon]="getCategoryIcon(type.category)" [size]="24"></svg>
                  </div>
                  <div>
                    <h3 class="font-bold text-surface-800 dark:text-white">{{ type.name }}</h3>
                    <span class="text-xs font-medium text-primary-500 dark:text-primary-400 uppercase">{{ type.category }}</span>
                  </div>
                </div>

                <p class="text-sm text-surface-500 dark:text-surface-400 mb-4 line-clamp-2">{{ type.description }}</p>

                <div class="grid grid-cols-2 gap-3 mb-5 text-sm">
                  <div class="p-3 rounded-xl bg-surface-50 dark:bg-surface-900/50">
                    <p class="text-surface-500 text-xs">Base Premium</p>
                    <p class="font-bold text-surface-800 dark:text-white">₹{{ type.basePremium | number }}/mo</p>
                  </div>
                  <div class="p-3 rounded-xl bg-surface-50 dark:bg-surface-900/50">
                    <p class="text-surface-500 text-xs">Max Coverage</p>
                    <p class="font-bold text-surface-800 dark:text-white">₹{{ type.maxCoverageAmount | number }}</p>
                  </div>
                  <div class="p-3 rounded-xl bg-surface-50 dark:bg-surface-900/50">
                    <p class="text-surface-500 text-xs">Term</p>
                    <p class="font-bold text-surface-800 dark:text-white">{{ type.termMonths }} months</p>
                  </div>
                  <div class="p-3 rounded-xl bg-surface-50 dark:bg-surface-900/50">
                    <p class="text-surface-500 text-xs">Deductible</p>
                    <p class="font-bold text-surface-800 dark:text-white">₹{{ type.deductibleAmount | number }}</p>
                  </div>
                </div>

                <button (click)="buyPolicy(type.id)" class="block w-full text-center py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all">
                  Get This Plan
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class PolicyTypeCatalogComponent implements OnInit {
  policyTypes: PolicyTypeResponse[] = [];
  loading = true;
  errorMessage = '';
  selectedCategory = '';
  categories: string[] = ['HEALTH', 'AUTO', 'HOME', 'LIFE', 'TRAVEL', 'BUSINESS'];

  readonly HeartPulse = LucideHeartPulse;
  readonly Car = LucideCar;
  readonly Home = LucideHome;
  readonly Heart = LucideHeart;
  readonly Plane = LucidePlane;
  readonly Briefcase = LucideBriefcase;
  readonly FileText = LucideFileText;

  constructor(
    private policyTypeService: PolicyTypeService, 
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(forceRefresh = false): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.policyTypeService.getActivePolicyTypes(forceRefresh).subscribe({
      next: (res) => {
        this.policyTypes = res;
        this.loading = false;
        if (this.policyTypes.length === 0) {
          // If perfectly successful but empty, it might be a temporary DB glitch,
          // but we'll respect the response.
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'The insurance catalog is temporarily unavailable. Please check your connection.';
        console.error('Policy catalog fetch error:', err);
      },
    });
  }

  get filteredTypes(): PolicyTypeResponse[] {
    if (!this.selectedCategory) return this.policyTypes;
    return this.policyTypes.filter((t) => t.category === this.selectedCategory);
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      HEALTH: 'heart-pulse', AUTO: 'car', HOME: 'home', LIFE: 'heart', TRAVEL: 'plane', BUSINESS: 'briefcase',
    };
    return icons[category] || 'file-text';
  }

  buyPolicy(typeId: number): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/policies/purchase'], { queryParams: { typeId } });
    } else {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: `/policies/purchase?typeId=${typeId}` } });
    }
  }
}
