import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { BankAccount, CustomerService, Transaction } from '../customer.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.scss'
})
export class CustomerDashboardComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly accountForm = this.formBuilder.group({
    rib: ['', [Validators.required]]
  });

  protected accounts: BankAccount[] = [];
  protected account: BankAccount | null = null;
  protected transactions: Transaction[] = [];
  protected sortedTransactions: Transaction[] = [];
  protected message = '';
  protected isLoading = false;
  protected page = 1;
  protected readonly pageSize = 10;
  private readonly transactionsByRib = new Map<string, Transaction[]>();

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.message = '';
    this.customerService.getMyAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        if (!accounts.length) {
          this.isLoading = false;
          this.message = 'No accounts available for this customer.';
          this.cdr.detectChanges();
          return;
        }

        forkJoin(
          accounts.map((acc) =>
            this.customerService.getTransactionsByRib(acc.rib)
          )
        ).subscribe({
          next: (transactionLists) => {
            accounts.forEach((acc, index) => {
              const list = transactionLists[index] ?? [];
              this.transactionsByRib.set(acc.rib, list);
            });
            const defaultRib = this.getMostActiveRib(accounts);
            this.accountForm.patchValue({ rib: defaultRib });
            this.onAccountChange(defaultRib);
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.isLoading = false;
            this.message = 'Could not load account activity.';
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.message = 'Could not load accounts.';
        this.cdr.detectChanges();
      }
    });
  }

  onAccountChange(rib: string): void {
    const matched = this.accounts.find((item) => item.rib === rib) ?? null;
    this.account = matched;
    this.page = 1;
    if (!matched) {
      this.transactions = [];
      this.sortedTransactions = [];
      this.message = 'No account found for this selection.';
      this.cdr.detectChanges();
      return;
    }
    const cached = this.transactionsByRib.get(rib);
    if (cached) {
      this.setTransactions(cached);
      this.cdr.detectChanges();
      return;
    }
    this.loadTransactions(rib);
  }

  private loadTransactions(rib: string): void {
    this.customerService.getTransactionsByRib(rib).subscribe({
      next: (transactions) => {
        this.transactionsByRib.set(rib, transactions);
        this.setTransactions(transactions);
        this.isLoading = false;
        if (!transactions.length) {
          this.message = 'No transactions found for this account.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.message = 'Could not load transactions.';
        this.cdr.detectChanges();
      }
    });
  }

  private setTransactions(transactions: Transaction[]): void {
    this.transactions = transactions;
    this.sortedTransactions = [...transactions].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  private getMostActiveRib(accounts: BankAccount[]): string {
    let selectedRib = accounts[0].rib;
    let latestTime = 0;
    for (const acc of accounts) {
      const transactions = this.transactionsByRib.get(acc.rib) ?? [];
      const last = transactions.reduce((max, tx) => {
        const time = new Date(tx.date).getTime();
        return time > max ? time : max;
      }, 0);
      if (last > latestTime) {
        latestTime = last;
        selectedRib = acc.rib;
      }
    }
    return selectedRib;
  }

  get pagedTransactions(): Transaction[] {
    const start = (this.page - 1) * this.pageSize;
    return this.sortedTransactions.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.transactions.length / this.pageSize));
  }

  goToPage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages) {
      return;
    }
    this.page = nextPage;
  }
}
