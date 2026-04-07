import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PolicyTypeService } from '../../../../core/services/policy-type.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PolicyTypeResponse, InsuranceCategory } from '../../../../core/models';
import { LucideDynamicIcon, LucideX, LucideSave, LucideCircleAlert } from '@lucide/angular';

@Component({
  selector: 'app-policy-type-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideDynamicIcon],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/20 dark:bg-surface-950/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white dark:bg-surface-900 w-full max-w-2xl rounded-2xl shadow-elevated border border-surface-200 dark:border-surface-800 overflow-hidden animate-scale-in">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between bg-surface-50/50 dark:bg-surface-800/30">
          <div>
            <h2 class="text-xl font-bold font-display text-surface-900 dark:text-white">{{ isEdit ? 'Edit Product' : 'Create New Product' }}</h2>
            <p class="text-xs text-surface-500 mt-0.5">Configure insurance product details and rules</p>
          </div>
          <button (click)="onClose.emit()" class="p-2 hover:bg-surface-200 dark:hover:bg-surface-800 rounded-lg transition-colors">
            <svg lucideIcon="x" [size]="20"></svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 max-h-[75vh] overflow-y-auto">
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Product Name</label>
                <input 
                  type="text" 
                  formControlName="name" 
                  class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-transparent text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="e.g., Premium Family Health Plan"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Category</label>
                <select 
                  formControlName="category" 
                  class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-transparent text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                >
                  <option *ngFor="let cat of categories" [value]="cat" class="bg-white text-surface-900 dark:bg-surface-900 dark:text-white">{{ cat }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Term (Months)</label>
                <input 
                  type="number" 
                  formControlName="termMonths" 
                  class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-transparent text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="12"
                />
              </div>
            </div>

            <!-- Financials -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-700">
              <div>
                <label class="block text-xs font-bold text-surface-500 uppercase mb-1.5">Base Premium (INR)</label>
                <input 
                  type="number" 
                  formControlName="basePremium" 
                  class="w-full px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 dark:text-white outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-surface-500 uppercase mb-1.5">Max Coverage (INR)</label>
                <input 
                  type="number" 
                  formControlName="maxCoverageAmount" 
                  class="w-full px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 dark:text-white outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-surface-500 uppercase mb-1.5">Deductible (INR)</label>
                <input 
                  type="number" 
                  formControlName="deductibleAmount" 
                  class="w-full px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <!-- Age Limits -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Minimum Age</label>
                <input 
                  type="number" 
                  formControlName="minAge" 
                  class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-transparent text-surface-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Maximum Age</label>
                <input 
                  type="number" 
                  formControlName="maxAge" 
                  class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-transparent text-surface-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <!-- Details -->
            <div>
              <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Description</label>
              <textarea 
                formControlName="description" 
                rows="2"
                class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-transparent text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none text-sm"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Coverage Details (Internal Terms)</label>
              <textarea 
                formControlName="coverageDetails" 
                rows="3"
                class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-transparent text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none text-sm"
                placeholder="List coverage benefits, exclusions, etc."
              ></textarea>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 bg-surface-50 dark:bg-surface-800/30 border-t border-surface-200 dark:border-surface-800 flex items-center justify-end gap-3">
          <button 
            type="button" 
            (click)="onClose.emit()" 
            class="px-5 py-2.5 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button" 
            (click)="onSubmit()"
            [disabled]="productForm.invalid || isLoading"
            class="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all"
          >
            <svg *ngIf="!isLoading" lucideIcon="save" [size]="18"></svg>
            <span *ngIf="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ isEdit ? 'Update Product' : 'Create Product' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class PolicyTypeFormComponent implements OnInit {
  @Input() policyType: PolicyTypeResponse | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  productForm: FormGroup;
  isLoading = false;
  isEdit = false;
  categories: InsuranceCategory[] = ['HEALTH', 'AUTO', 'HOME', 'LIFE', 'TRAVEL', 'BUSINESS'];

  constructor(
    private fb: FormBuilder,
    private policyTypeService: PolicyTypeService,
    private notificationService: NotificationService
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['HEALTH', Validators.required],
      basePremium: [0, [Validators.required, Validators.min(1)]],
      maxCoverageAmount: [0, [Validators.required, Validators.min(1000)]],
      deductibleAmount: [0, [Validators.required, Validators.min(0)]],
      termMonths: [12, [Validators.required, Validators.min(1)]],
      minAge: [18, [Validators.required, Validators.min(0)]],
      maxAge: [100, [Validators.required, Validators.min(1)]],
      coverageDetails: [''],
    });
  }

  ngOnInit(): void {
    if (this.policyType) {
      this.isEdit = true;
      this.productForm.patchValue(this.policyType);
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    this.isLoading = true;
    const request = this.productForm.value;

    if (this.isEdit && this.policyType) {
      this.policyTypeService.updatePolicyType(this.policyType.id, request).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success('Update Successful', `${request.name} has been updated.`);
          this.onSave.emit();
        },
        error: (err) => {
          this.isLoading = false;
          this.notificationService.error('Update Failed', err.message || 'Check connection to backend.');
        },
      });
    } else {
      this.policyTypeService.createPolicyType(request).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success('Creation Successful', `${request.name} has been added to the catalog.`);
          this.onSave.emit();
        },
        error: (err) => {
          this.isLoading = false;
          this.notificationService.error('Creation Failed', err.message || 'Check connection to backend.');
        },
      });
    }
  }
}
