/**
 * Authentication Interceptor
 *
 * Functional HTTP interceptor for request authentication.
 * Adds authorization headers to outgoing requests.
 * Extend with token attachment logic as authentication is implemented.
 */

import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { StorageService } from '@core/services/storage.service';
import { STORAGE_KEYS } from '@core/constants/storage-keys';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const token = storageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);

  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }
  return next(req);
};
