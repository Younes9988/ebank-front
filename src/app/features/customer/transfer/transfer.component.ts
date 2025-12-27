import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CustomerService } from '../customer.service';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.scss'
})
export class TransferComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);

  protected readonly transferForm = this.formBuilder.group({
    sourceRib: ['', [Validators.required, Validators.minLength(10)]],
    destinationRib: ['', [Validators.required, Validators.minLength(10)]],
    amount: [0, [Validators.required, Validators.min(1)]],
    label: ['', [Validators.required, Validators.minLength(3)]]
  });

  protected transferMessage = '';
  protected isTransferSubmitting = false;

  submitTransfer(): void {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    this.isTransferSubmitting = true;
    this.transferMessage = '';

    const value = this.transferForm.getRawValue();
    this.customerService.transfer({
      sourceRib: value.sourceRib ?? '',
      destinationRib: value.destinationRib ?? '',
      amount: Number(value.amount ?? 0),
      label: value.label ?? ''
    }).subscribe({
      next: () => {
        this.isTransferSubmitting = false;
        this.transferMessage = 'Transfer completed successfully.';
        this.transferForm.reset({ amount: 0 });
      },
      error: () => {
        this.isTransferSubmitting = false;
        this.transferMessage = 'Transfer failed. Please verify the details.';
      }
    });
  }
}
