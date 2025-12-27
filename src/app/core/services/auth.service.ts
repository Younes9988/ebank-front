import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type UserRole = 'AGENT' | 'CUSTOMER';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiBase = 'http://localhost:8080/api';
  private readonly tokenKey = 'ebank.token';
  private readonly roleKey = 'ebank.role';
  private readonly storageAvailable = typeof localStorage !== 'undefined';

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<UserRole | null> {
    return this.http.post<LoginResponse>(`${this.apiBase}/auth/login`, request).pipe(
      map((response) => {
        this.setToken(response.token);
        const role = this.extractRole(response.token);
        if (role) {
          this.setRole(role);
        } else {
          this.clearRole();
        }
        return role;
      })
    );
  }

  logout(): void {
    if (!this.storageAvailable) {
      return;
    }
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
  }

  setRoleFallback(role: UserRole): void {
    this.setRole(role);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    if (!this.storageAvailable) {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): UserRole | null {
    if (!this.storageAvailable) {
      return null;
    }
    const role = localStorage.getItem(this.roleKey);
    return role === 'AGENT' || role === 'CUSTOMER' ? role : null;
  }

  private setToken(token: string): void {
    if (!this.storageAvailable) {
      return;
    }
    localStorage.setItem(this.tokenKey, token);
  }

  private setRole(role: UserRole): void {
    if (!this.storageAvailable) {
      return;
    }
    localStorage.setItem(this.roleKey, role);
  }

  private clearRole(): void {
    if (!this.storageAvailable) {
      return;
    }
    localStorage.removeItem(this.roleKey);
  }

  private extractRole(token: string): UserRole | null {
    const payload = this.decodePayload(token);
    if (!payload) {
      return null;
    }

    const roleValue = payload['role'];
    if (typeof roleValue === 'string') {
      return this.normalizeRole(roleValue);
    }

    const rolesValue = payload['roles'] ?? payload['authorities'];
    if (Array.isArray(rolesValue)) {
      for (const entry of rolesValue) {
        if (typeof entry === 'string') {
          const normalized = this.normalizeRole(entry);
          if (normalized) {
            return normalized;
          }
        }
        if (entry && typeof entry === 'object') {
          const authority = entry['authority'];
          if (typeof authority === 'string') {
            const normalized = this.normalizeRole(authority);
            if (normalized) {
              return normalized;
            }
          }
        }
      }
    }

    return null;
  }

  private normalizeRole(value: string): UserRole | null {
    const cleaned = value.replace('ROLE_', '').toUpperCase();
    if (cleaned === 'AGENT' || cleaned === 'CUSTOMER') {
      return cleaned;
    }
    return null;
  }

  private decodePayload(token: string): Record<string, unknown> | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    try {
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '='));
      return JSON.parse(decoded) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
