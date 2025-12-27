import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AgentService, Costumer } from '../agent.service';

@Component({
  selector: 'app-agent-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agent-customers.component.html',
  styleUrl: './agent-customers.component.scss'
})
export class AgentCustomersComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly agentService = inject(AgentService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected customers: Costumer[] = [];
  protected message = '';
  protected isLoading = false;
  protected isSubmitting = false;

  protected readonly customerForm = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    identityNumber: ['', [Validators.required, Validators.minLength(5)]],
    dateOfBirth: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.agentService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.message = 'Could not load customers.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  createCustomer(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    const value = this.customerForm.getRawValue();
    this.agentService.createCustomer({
      firstName: value.firstName ?? '',
      lastName: value.lastName ?? '',
      identityNumber: value.identityNumber ?? '',
      dateOfBirth: value.dateOfBirth ?? '',
      email: value.email ?? '',
      address: value.address ?? ''
    }).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.message = `Customer ${created.firstName} ${created.lastName} created.`;
        this.customerForm.reset();
        this.loadCustomers();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSubmitting = false;
        this.message = 'Customer creation failed.';
        this.cdr.detectChanges();
      }
    });
  }
}
