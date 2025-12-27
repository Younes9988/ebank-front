import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CustomerService } from '../customer.service';

@Component({
  selector: 'app-customer-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-settings.component.html',
  styleUrl: './customer-settings.component.scss'
})
export class CustomerSettingsComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);

  protected readonly passwordForm = this.formBuilder.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  protected isSubmitting = false;
  protected message = '';

  updatePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const value = this.passwordForm.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.message = 'New password and confirmation do not match.';
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    this.customerService.changePassword({
      currentPassword: value.currentPassword ?? '',
      newPassword: value.newPassword ?? ''
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.message = 'Password updated successfully.';
        this.passwordForm.reset();
      },
      error: () => {
        this.isSubmitting = false;
        this.message = 'Password update failed.';
      }
    });
  }
}
