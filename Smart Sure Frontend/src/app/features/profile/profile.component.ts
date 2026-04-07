import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService, PaymentPreference } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserResponse, AddressResponse } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { LucideDynamicIcon, LucideUser, LucideMapPin, LucideCreditCard, LucideSave, LucideEdit } from '@lucide/angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, LucideDynamicIcon],
  template: `
    <div class="px-4 py-8 max-w-4xl mx-auto animate-fade-in">
      
      <div class="mb-8">
        <h1 class="text-3xl font-bold font-display text-surface-900 dark:text-white">My Profile</h1>
        <p class="text-surface-500 dark:text-surface-400 mt-1">Manage your personal information, address, and payment preferences.</p>
      </div>

      @if (loading) {
        <app-loading-spinner />
      } @else {

        <!-- Personal Information -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card border border-surface-200 dark:border-surface-700 mb-6 overflow-hidden">
          <div class="p-6 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <h2 class="flex items-center gap-2 text-lg font-bold text-surface-900 dark:text-white">
              <svg lucideIcon="user" [size]="20" class="text-primary-500"></svg> Personal Information
            </h2>
            @if (!editingUser) {
              <button (click)="editingUser = true" class="text-sm font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1 transition-colors">
                <svg lucideIcon="edit" [size]="14"></svg> Edit
              </button>
            }
          </div>
          <div class="p-6">
            @if (!editingUser) {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500">First Name</label>
                  <p class="mt-1 text-surface-900 dark:text-white font-medium">{{ user?.firstName || '—' }}</p>
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500">Last Name</label>
                  <p class="mt-1 text-surface-900 dark:text-white font-medium">{{ user?.lastName || '—' }}</p>
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500">Email</label>
                  <p class="mt-1 text-surface-900 dark:text-white font-medium">{{ user?.email || '—' }}</p>
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500">Phone</label>
                  <p class="mt-1 text-surface-900 dark:text-white font-medium">{{ user?.phone || '—' }}</p>
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500">Role</label>
                  <p class="mt-1"><span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-primary-50 text-primary-600 border-primary-200">{{ user?.role || '—' }}</span></p>
                </div>
              </div>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500 mb-1 block">First Name</label>
                  <input [(ngModel)]="editUser.firstName" class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all" />
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500 mb-1 block">Last Name</label>
                  <input [(ngModel)]="editUser.lastName" class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all" />
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500 mb-1 block">Email</label>
                  <input [(ngModel)]="editUser.email" class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all" />
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500 mb-1 block">Phone</label>
                  <input [(ngModel)]="editUser.phone" type="number" class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all" />
                </div>
              </div>
              <div class="mt-6 flex items-center justify-end gap-3">
                <button (click)="cancelUserEdit()" class="px-6 py-2.5 text-surface-600 dark:text-surface-400 font-semibold hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl transition-all">
                  Cancel
                </button>
                <button (click)="saveUser()" [disabled]="savingUser" class="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center gap-2">
                  <svg lucideIcon="save" [size]="16"></svg> {{ savingUser ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Address -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card border border-surface-200 dark:border-surface-700 mb-6 overflow-hidden">
          <div class="p-6 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <h2 class="flex items-center gap-2 text-lg font-bold text-surface-900 dark:text-white">
              <svg lucideIcon="map-pin" [size]="20" class="text-primary-500"></svg> Address
            </h2>
            @if (!editingAddress) {
              <button (click)="editingAddress = true" class="text-sm font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1 transition-colors">
                <svg lucideIcon="edit" [size]="14"></svg> {{ address ? 'Edit' : 'Add' }}
              </button>
            }
          </div>
          <div class="p-6">
            @if (!editingAddress && address) {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500">Street</label>
                  <p class="mt-1 text-surface-900 dark:text-white font-medium">{{ address.street_address }}</p>
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500">City</label>
                  <p class="mt-1 text-surface-900 dark:text-white font-medium">{{ address.city }}</p>
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500">State</label>
                  <p class="mt-1 text-surface-900 dark:text-white font-medium">{{ address.state }}</p>
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500">ZIP</label>
                  <p class="mt-1 text-surface-900 dark:text-white font-medium">{{ address.zip }}</p>
                </div>
              </div>
            } @else if (!editingAddress && !address) {
              <div class="text-center py-4">
                <p class="text-surface-500 dark:text-surface-400 text-sm">No address on file.</p>
              </div>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500 mb-1 block">Street Address</label>
                  <input [(ngModel)]="editAddress.street_address" class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all" />
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500 mb-1 block">City</label>
                  <input [(ngModel)]="editAddress.city" class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all" />
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500 mb-1 block">State</label>
                  <input [(ngModel)]="editAddress.state" class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all" />
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500 mb-1 block">ZIP Code</label>
                  <input [(ngModel)]="editAddress.zip" type="number" class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all" />
                </div>
              </div>
              <div class="mt-6 flex items-center justify-end gap-3">
                <button (click)="cancelAddressEdit()" class="px-6 py-2.5 text-surface-600 dark:text-surface-400 font-semibold hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl transition-all">
                  Cancel
                </button>
                <button (click)="saveAddress()" [disabled]="savingAddress" class="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center gap-2">
                  <svg lucideIcon="save" [size]="16"></svg> {{ savingAddress ? 'Saving...' : 'Save Address' }}
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Payment Preferences -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card border border-surface-200 dark:border-surface-700 overflow-hidden mb-8">
          <div class="p-6 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <h2 class="flex items-center gap-2 text-lg font-bold text-surface-900 dark:text-white">
                <svg lucideIcon="credit-card" [size]="20" class="text-primary-500"></svg> Payment Preferences
              </h2>
              @if (editingPayment) {
                <p class="text-surface-500 dark:text-surface-400 text-sm mt-1">Set your preferred payment method for premium payments.</p>
              }
            </div>
            @if (!editingPayment) {
              <button (click)="editingPayment = true" class="text-sm font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1 transition-colors">
                <svg lucideIcon="edit" [size]="14"></svg> Edit
              </button>
            }
          </div>
          <div class="p-6">
            @if (!editingPayment) {
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
                  <svg lucideIcon="credit-card" [size]="24"></svg>
                </div>
                <div>
                  @if (paymentPref.method) {
                    <p class="text-surface-900 dark:text-white font-bold text-lg">{{ paymentPref.method }}</p>
                    <p class="text-surface-500 dark:text-surface-400 text-sm">
                      @if (paymentPref.method === 'UPI') { {{ paymentPref.upiId }} }
                      @else if (paymentPref.method === 'CREDIT_CARD' || paymentPref.method === 'DEBIT_CARD') { {{ paymentPref.cardLabel }} }
                      @else if (paymentPref.method === 'NET_BANKING') { {{ paymentPref.bankName }} }
                      @else if (paymentPref.method === 'WALLET') { {{ paymentPref.walletName }} }
                    </p>
                  } @else {
                    <p class="text-surface-900 dark:text-white font-bold">No preference set</p>
                    <p class="text-surface-500 dark:text-surface-400 text-sm">Click Edit to set your preferred payment method.</p>
                  }
                </div>
              </div>
            } @else {
              <div class="space-y-4">
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-surface-500 mb-2 block">Preferred Method</label>
                  <select [(ngModel)]="paymentPref.method" (ngModelChange)="onMethodChange()" class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all appearance-none">
                    <option value="">— Select a method —</option>
                    <option value="UPI">UPI</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="WALLET">Wallet</option>
                  </select>
                </div>

                @if (paymentPref.method === 'UPI') {
                  <div>
                    <label class="text-xs font-bold uppercase tracking-widest text-surface-500 mb-1 block">UPI ID</label>
                    <input [(ngModel)]="paymentPref.upiId" placeholder="yourname@upi" class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all" />
                  </div>
                }
                @if (paymentPref.method === 'CREDIT_CARD' || paymentPref.method === 'DEBIT_CARD') {
                  <div>
                    <label class="text-xs font-bold uppercase tracking-widest text-surface-500 mb-1 block">Card Label (e.g. "HDFC Visa ending 4242")</label>
                    <input [(ngModel)]="paymentPref.cardLabel" placeholder="Card nickname" class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all" />
                  </div>
                }
                @if (paymentPref.method === 'NET_BANKING') {
                  <div>
                    <label class="text-xs font-bold uppercase tracking-widest text-surface-500 mb-1 block">Bank Name</label>
                    <input [(ngModel)]="paymentPref.bankName" placeholder="HDFC Bank" class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all" />
                  </div>
                }
                @if (paymentPref.method === 'WALLET') {
                  <div>
                    <label class="text-xs font-bold uppercase tracking-widest text-surface-500 mb-1 block">Wallet Name</label>
                    <input [(ngModel)]="paymentPref.walletName" placeholder="Paytm / PhonePe" class="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all" />
                  </div>
                }

                <div class="flex items-center justify-end gap-3 pt-4">
                  <button (click)="cancelPaymentEdit()" class="px-6 py-2.5 text-surface-600 dark:text-surface-400 font-semibold hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl transition-all">
                    Cancel
                  </button>
                  <button (click)="savePaymentPref()" class="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2">
                    <svg lucideIcon="save" [size]="16"></svg> Save Preference
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

      }
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: UserResponse | null = null;
  address: AddressResponse | null = null;
  loading = true;
  userId: number | null = null;

  editingUser = false;
  editingAddress = false;
  savingUser = false;
  savingAddress = false;

  editUser = { firstName: '', lastName: '', email: '', phone: 0 };
  editAddress = { city: '', state: '', zip: 0, street_address: '' };

  paymentPref: PaymentPreference = { method: '' };
  editingPayment = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (this.userId) {
      this.loadProfile();
      this.paymentPref = this.userService.getPaymentPreference(this.userId);
    } else {
      this.loading = false;
    }
  }

  loadProfile(): void {
    if (!this.userId) return;
    this.userService.getInfo(this.userId).subscribe({
      next: (res) => {
        this.user = res;
        this.editUser = {
          firstName: res.firstName || '',
          lastName: res.lastName || '',
          email: res.email || '',
          phone: res.phone || 0
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.warning('Profile', 'Could not load profile. You may need to add your info first.');
      }
    });

    this.userService.getAddress(this.userId).subscribe({
      next: (res) => {
        this.address = res;
        this.editAddress = {
          city: res.city || '',
          state: res.state || '',
          zip: res.zip || 0,
          street_address: res.street_address || ''
        };
      },
      error: () => {
        // No address yet — that's fine
      }
    });
  }

  cancelUserEdit(): void {
    if (this.user) {
      this.editUser = {
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        email: this.user.email || '',
        phone: this.user.phone || 0
      };
    }
    this.editingUser = false;
  }

  saveUser(): void {
    if (!this.userId) return;
    this.savingUser = true;
    this.userService.updateInfo(this.userId, this.editUser).subscribe({
      next: (res) => {
        this.user = res;
        this.editingUser = false;
        this.savingUser = false;
        this.notificationService.success('Profile Updated', 'Your information has been saved.');
      },
      error: () => {
        this.savingUser = false;
        this.notificationService.error('Error', 'Failed to update profile.');
      }
    });
  }

  cancelAddressEdit(): void {
    if (this.address) {
      this.editAddress = {
        city: this.address.city || '',
        state: this.address.state || '',
        zip: this.address.zip || 0,
        street_address: this.address.street_address || ''
      };
    } else {
      this.editAddress = { city: '', state: '', zip: 0, street_address: '' };
    }
    this.editingAddress = false;
  }

  saveAddress(): void {
    if (!this.userId) return;
    this.savingAddress = true;
    const obs = this.address
      ? this.userService.updateAddress(this.userId, this.editAddress)
      : this.userService.addAddress(this.userId, this.editAddress);

    obs.subscribe({
      next: (res) => {
        this.address = res;
        this.editingAddress = false;
        this.savingAddress = false;
        this.notificationService.success('Address Saved', 'Your address has been updated.');
      },
      error: () => {
        this.savingAddress = false;
        this.notificationService.error('Error', 'Failed to save address.');
      }
    });
  }

  cancelPaymentEdit(): void {
    if (this.userId) {
      this.paymentPref = this.userService.getPaymentPreference(this.userId);
    }
    this.editingPayment = false;
  }

  onMethodChange(): void {
    // Clear sub-fields when method changes
    this.paymentPref.upiId = undefined;
    this.paymentPref.cardLabel = undefined;
    this.paymentPref.bankName = undefined;
    this.paymentPref.walletName = undefined;
  }

  savePaymentPref(): void {
    if (this.userId) {
      this.userService.savePaymentPreference(this.userId, this.paymentPref);
    }
    this.editingPayment = false;
    this.notificationService.success('Saved', 'Payment preference updated.');
  }
}
