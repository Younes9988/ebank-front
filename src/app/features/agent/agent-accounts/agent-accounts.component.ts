import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AgentService, BankAccount } from '../agent.service';

@Component({
  selector: 'app-agent-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agent-accounts.component.html',
  styleUrl: './agent-accounts.component.scss'
})
export class AgentAccountsComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly agentService = inject(AgentService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected accounts: BankAccount[] = [];
  protected message = '';
  protected isLoading = false;
  protected isSubmitting = false;

  protected readonly accountForm = this.formBuilder.group({
    rib: ['', [Validators.required, Validators.minLength(10)]],
    initialBalance: [0, [Validators.required, Validators.min(0)]],
    costumerId: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.agentService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.message = 'Could not load accounts.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  createAccount(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    const value = this.accountForm.getRawValue();
    this.agentService.createAccount({
      rib: value.rib ?? '',
      initialBalance: Number(value.initialBalance ?? 0),
      costumerId: Number(value.costumerId ?? 0)
    }).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.message = `Account ${created.rib} created.`;
        this.accountForm.reset({ initialBalance: 0, costumerId: null });
        this.loadAccounts();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSubmitting = false;
        this.message = 'Account creation failed.';
        this.cdr.detectChanges();
      }
    });
  }
}
