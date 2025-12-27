import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService, UserRole } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const requiredRole = route.data['role'] as UserRole | undefined;
  const currentRole = authService.getRole();

  if (!requiredRole) {
    return true;
  }

  if (!currentRole) {
    if (requiredRole === 'CUSTOMER' && authService.isAuthenticated()) {
      authService.setRoleFallback('CUSTOMER');
      return true;
    }
    router.navigate(['/login']);
    return false;
  }

  if (currentRole === requiredRole) {
    return true;
  }

  router.navigate([`/${currentRole.toLowerCase()}/dashboard`]);
  return false;
};
