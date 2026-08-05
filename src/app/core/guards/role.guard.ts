import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/auth.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (_route, _state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasRole(allowedRoles)) {
      return true;
    }

    return router.createUrlTree(['/dashboard']);
  };
};
