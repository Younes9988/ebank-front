import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BankAccount {
  id: number;
  rib: string;
  balance: number;
  status: string;
  costumerId: number;
}

export interface TransferRequest {
  sourceRib: string;
  destinationRib: string;
  amount: number;
  label: string;
}

export interface Transaction {
  id: number;
  type: string;
  amount: number;
  date: string;
  label: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly apiBase = 'http://localhost:8080/api';

  constructor(private readonly http: HttpClient) {}

  getMyAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.apiBase}/accounts/me`);
  }

  getTransactionsByRib(rib: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiBase}/transactions/account/${rib}`);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.apiBase}/customers/me/password`, request);
  }

  transfer(request: TransferRequest): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/transactions/transfer`, request);
  }
}
