import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Costumer {
  id: number;
  firstName: string;
  lastName: string;
  identityNumber: string;
  dateOfBirth: string;
  email: string;
  address: string;
}

export interface BankAccount {
  id: number;
  rib: string;
  balance: number;
  status: string;
  costumerId: number;
}

export interface Transaction {
  id: number;
  type: string;
  amount: number;
  date: string;
  label: string;
}

export interface CreateCostumerRequest {
  firstName: string;
  lastName: string;
  identityNumber: string;
  dateOfBirth: string;
  email: string;
  address: string;
}

export interface CreateBankAccountRequest {
  rib: string;
  initialBalance: number;
  costumerId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private readonly apiBase = 'http://localhost:8080/api';

  constructor(private readonly http: HttpClient) {}

  getCustomers(): Observable<Costumer[]> {
    return this.http.get<Costumer[]>(`${this.apiBase}/customers`);
  }

  createCustomer(request: CreateCostumerRequest): Observable<Costumer> {
    return this.http.post<Costumer>(`${this.apiBase}/customers`, request);
  }

  getAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.apiBase}/accounts`);
  }

  createAccount(request: CreateBankAccountRequest): Observable<BankAccount> {
    return this.http.post<BankAccount>(`${this.apiBase}/accounts`, request);
  }

  getTransactionsByRib(rib: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiBase}/transactions/account/${rib}`);
  }
}
