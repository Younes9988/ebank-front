import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  protected isSubmitting = false;
  protected errorMessage = '';

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const credentials = this.loginForm.getRawValue();
    this.authService.login({
      email: credentials.email ?? '',
      password: credentials.password ?? ''
    }).subscribe({
      next: (role) => {
        this.isSubmitting = false;
        if (role === 'AGENT') {
          this.router.navigate(['/agent/customers']);
          return;
        }
        if (role === 'CUSTOMER' || !role) {
          if (!role) {
            this.authService.setRoleFallback('CUSTOMER');
          }
          this.router.navigate(['/customer/dashboard']);
          return;
        }
        this.errorMessage = 'Unable to determine your role. Please contact support.';
        this.authService.logout();
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Invalid email or password.';
      }
    });
  }
}
