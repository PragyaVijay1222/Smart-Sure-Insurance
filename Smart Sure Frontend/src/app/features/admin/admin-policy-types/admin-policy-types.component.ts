import { Component, OnInit, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PolicyTypeService } from '../../../core/services/policy-type.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PolicyTypeResponse } from '../../../core/models';
import { LucideDynamicIcon } from '@lucide/angular';
import { PolicyTypeFormComponent } from './policy-type-form/policy-type-form.component';

@Component({
  selector: 'app-admin-policy-types',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LucideDynamicIcon, 
    PolicyTypeFormComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 min-h-screen bg-surface-50 dark:bg-surface-950 animate-fade-in text-surface-900 dark:text-surface-50">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold font-display flex items-center gap-3">
            <svg lucideIcon="shield" class="text-primary-500"></svg>
            Insurance Products
          </h1>
          <p class="text-surface-500 dark:text-surface-400 mt-1">Manage and configure your insurance policy catalog</p>
        </div>
        <button 
          (click)="openCreateForm()"
          class="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-600/20 transition-all active:scale-95"
        >
          <svg lucideIcon="plus" [size]="20"></svg>
          Add New Product
        </button>
      </div>

      <!-- Stats Overview (Computed Signals - Guideline 21) -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white dark:bg-surface-900 p-5 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-card">
          <div class="text-sm font-medium text-surface-500 dark:text-surface-400 mb-1 font-display">Total Products</div>
          <div class="text-2xl font-bold">{{ policyTypes().length }}</div>
        </div>
        <div class="bg-white dark:bg-surface-900 p-5 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-card">
          <div class="text-sm font-medium text-surface-500 dark:text-surface-400 mb-1 font-display">Active Plans</div>
          <div class="text-2xl font-bold text-accent-600 dark:text-accent-400">{{ activeCount() }}</div>
        </div>
        <div class="bg-white dark:bg-surface-900 p-5 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-card">
          <div class="text-sm font-medium text-surface-500 dark:text-surface-400 mb-1 font-display">Categories</div>
          <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ uniqueCategories() }}</div>
        </div>
        <div class="bg-white dark:bg-surface-900 p-5 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-card">
          <div class="text-sm font-medium text-surface-500 dark:text-surface-400 mb-1 font-display">Max Coverage</div>
          <div class="text-2xl font-bold">{{ maxCoverage() | currency:'INR':'symbol':'1.0-0' }}</div>
        </div>
      </div>

      <!-- Main Content Table -->
      <div class="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-50 dark:bg-surface-800/50">
                <th class="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Product Name</th>
                <th class="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Category</th>
                <th class="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Premium</th>
                <th class="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Coverage</th>
                <th class="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-200 dark:divide-surface-800">
              @for (type of policyTypes(); track type.id) {
                <tr class="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors">
                  <td class="px-6 py-4">
                    <button (click)="viewProductDetail(type)" class="text-left group/name">
                      <div class="font-semibold text-surface-900 dark:text-white group-hover/name:text-primary-500 transition-colors">{{ type.name }}</div>
                      <div class="text-xs text-surface-500 dark:text-surface-400 max-w-xs truncate">{{ type.description }}</div>
                    </button>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                      {{ type.category }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-surface-900 dark:text-white">{{ type.basePremium | currency:'INR' }}</div>
                    <div class="text-xs text-surface-500">per month</div>
                  </td>
                  <td class="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                    {{ type.maxCoverageAmount | currency:'INR':'symbol':'1.0-0' }}
                  </td>
                  <td class="px-6 py-4">
                    <span [ngClass]="{
                      'bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300': type.status === 'ACTIVE',
                      'bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300': type.status !== 'ACTIVE'
                    }" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      <svg [lucideIcon]="type.status === 'ACTIVE' ? 'check-circle' : 'circle-x'" [size]="12"></svg>
                      {{ type.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button 
                        (click)="openEditForm(type)"
                        class="p-2 text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <svg lucideIcon="edit" [size]="18"></svg>
                      </button>
                      <button 
                        (click)="deleteProduct(type)"
                        class="p-2 text-surface-400 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-lg transition-colors"
                        title="Discontinue Product"
                      >
                        <svg lucideIcon="trash-2" [size]="18"></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-surface-500">
                    No insurance products found. Start by creating one!
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Form Component Modal-like (Guideline 8 & 9) -->
      @if (showForm()) {
        <app-policy-type-form 
          [policyType]="selectedType()"
          (onClose)="closeForm()"
          (onSave)="handleSave()"
        ></app-policy-type-form>
      }

      <!-- Product Detail Modal (Guideline 9) -->
      @if (selectedProduct()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-surface-950/60 backdrop-blur-md" (click)="closeProductDetail()"></div>
          
          <!-- Modal Content -->
          <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card !bg-surface-50/90 dark:!bg-surface-900/90 border-primary-500/20 shadow-2xl shadow-primary-500/10 flex flex-col animate-in zoom-in-95 duration-300">
            
            <!-- Modal Header -->
            <div class="sticky top-0 z-10 p-6 border-b border-surface-200 dark:border-white/10 flex items-center justify-between bg-inherit backdrop-blur-md">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                  <svg lucideIcon="layers" [size]="24"></svg>
                </div>
                <div>
                  <h2 class="text-xl font-bold font-display text-surface-900 dark:text-white">{{ selectedProduct()?.name }}</h2>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-500 uppercase tracking-widest border border-primary-500/20">
                      {{ selectedProduct()?.category }}
                    </span>
                    <span class="text-xs text-surface-500 dark:text-surface-400">• Created on {{ selectedProduct()?.createdAt | date }}</span>
                  </div>
                </div>
              </div>
              <button (click)="closeProductDetail()" class="p-2 hover:bg-surface-200 dark:hover:bg-white/10 rounded-xl transition-colors">
                <svg lucideIcon="x" [size]="20"></svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-8">
              
              <!-- Description Section -->
              <div class="space-y-2">
                <h3 class="text-[10px] font-bold uppercase tracking-widest text-surface-400 flex items-center gap-2">
                  <svg lucideIcon="file-text" [size]="12"></svg>
                  Description & Coverage
                </h3>
                <p class="text-sm text-surface-600 dark:text-surface-300 leading-relaxed italic">
                  "{{ selectedProduct()?.description }}"
                </p>
                <div class="mt-4 p-4 rounded-2xl bg-surface-100 dark:bg-white/5 border border-surface-200 dark:border-white/5 text-sm text-surface-700 dark:text-surface-200">
                  {{ selectedProduct()?.coverageDetails || 'No additional coverage details provided.' }}
                </div>
              </div>

              <!-- Metrics Grid -->
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 rounded-2xl bg-surface-100 dark:bg-white/5 border border-surface-200 dark:border-white/5">
                  <p class="text-[10px] uppercase font-bold text-surface-500 mb-1 tracking-wider">Base Premium</p>
                  <p class="text-lg font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
                    <svg lucideIcon="indian-rupee" [size]="16"></svg>
                    {{ selectedProduct()?.basePremium | number }} <span class="text-[10px] text-surface-500 font-normal">/mo</span>
                  </p>
                </div>
                <div class="p-4 rounded-2xl bg-surface-100 dark:bg-white/5 border border-surface-200 dark:border-white/5">
                  <p class="text-[10px] uppercase font-bold text-surface-500 mb-1 tracking-wider">Max Coverage</p>
                  <p class="text-lg font-bold text-accent-600 dark:text-accent-400 flex items-center gap-1">
                    <svg lucideIcon="award" [size]="16"></svg>
                    {{ selectedProduct()?.maxCoverageAmount | number }}
                  </p>
                </div>
                <div class="p-4 rounded-2xl bg-surface-100 dark:bg-white/5 border border-surface-200 dark:border-white/5">
                  <p class="text-[10px] uppercase font-bold text-surface-500 mb-1 tracking-wider">Deductible</p>
                  <p class="text-lg font-bold text-surface-900 dark:text-white">₹{{ selectedProduct()?.deductibleAmount | number }}</p>
                </div>
                <div class="p-4 rounded-2xl bg-surface-100 dark:bg-white/5 border border-surface-200 dark:border-white/5">
                  <p class="text-[10px] uppercase font-bold text-surface-500 mb-1 tracking-wider">Term Length</p>
                  <p class="text-lg font-bold text-surface-900 dark:text-white">{{ selectedProduct()?.termMonths }} Months</p>
                </div>
              </div>

              <!-- Eligibility Section -->
              <div class="p-6 rounded-3xl bg-gradient-to-br from-primary-500/5 to-accent-500/5 border border-primary-500/10">
                <h3 class="text-[10px] font-bold uppercase tracking-widest text-primary-500 mb-4 flex items-center gap-2">
                  <svg lucideIcon="user-plus" [size]="12"></svg>
                  Eligibility Requirements
                </h3>
                <div class="flex items-center justify-between">
                  <div class="text-center flex-1 border-r border-primary-500/10">
                    <p class="text-[10px] text-surface-500 uppercase font-bold mb-1">Min Age</p>
                    <p class="text-xl font-bold text-surface-900 dark:text-white">{{ selectedProduct()?.minAge || 'Any' }}</p>
                  </div>
                  <div class="text-center flex-1">
                    <p class="text-[10px] text-surface-500 uppercase font-bold mb-1">Max Age</p>
                    <p class="text-xl font-bold text-surface-900 dark:text-white">{{ selectedProduct()?.maxAge || 'Any' }}</p>
                  </div>
                </div>
              </div>

            </div>

            <!-- Modal Footer -->
            <div class="p-6 border-t border-surface-200 dark:border-white/10 flex justify-between items-center bg-inherit backdrop-blur-md">
               <div class="flex items-center gap-3">
                 <span [ngClass]="{
                   'bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300': selectedProduct()?.status === 'ACTIVE',
                   'bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300': selectedProduct()?.status !== 'ACTIVE'
                 }" class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-current/20">
                   {{ selectedProduct()?.status }}
                 </span>
               </div>
               <button (click)="closeProductDetail()" class="px-8 py-2.5 bg-surface-900 dark:bg-white text-surface-50 dark:text-surface-950 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                  Close Detail
               </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminPolicyTypesComponent implements OnInit {
  // Signal State (Guideline 6)
  policyTypes = signal<PolicyTypeResponse[]>([]);
  showForm = signal(false);
  selectedType = signal<PolicyTypeResponse | null>(null);
  selectedProduct = signal<PolicyTypeResponse | null>(null);

  // Derived State (Computed Signals - Guideline 21)
  activeCount = computed(() => this.policyTypes().filter(t => t.status === 'ACTIVE').length);
  uniqueCategories = computed(() => new Set(this.policyTypes().map(t => t.category)).size);
  maxCoverage = computed(() => Math.max(...this.policyTypes().map(t => t.maxCoverageAmount), 0));

  constructor(
    private policyTypeService: PolicyTypeService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPolicyTypes();
  }

  loadPolicyTypes(): void {
    this.policyTypeService.getAllPolicyTypes().subscribe({
      next: (data) => {
        this.policyTypes.set(data);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('Failed to load products', err.message);
        this.cdr.detectChanges();
      }
    });
  }

  openCreateForm(): void {
    this.selectedType.set(null);
    this.showForm.set(true);
  }

  openEditForm(type: PolicyTypeResponse): void {
    this.selectedType.set(type);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.selectedType.set(null);
  }

  handleSave(): void {
    this.closeForm();
    this.loadPolicyTypes();
  }

  viewProductDetail(product: PolicyTypeResponse): void {
    this.selectedProduct.set(product);
  }

  closeProductDetail(): void {
    this.selectedProduct.set(null);
  }

  deleteProduct(type: PolicyTypeResponse): void {
    if (confirm(`Are you sure you want to discontinue ${type.name}?`)) {
      this.policyTypeService.deletePolicyType(type.id).subscribe({
        next: () => {
          this.notificationService.success('Product discontinued', `${type.name} is now inactive.`);
          this.loadPolicyTypes();
        },
        error: (err) => {
          this.notificationService.error('Action failed', err.message);
          this.cdr.detectChanges();
        }
      });
    }
  }
}
