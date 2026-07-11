/**
 * Loading Interceptor
 *
 * Functional HTTP interceptor for loading state management.
 * Extended with loading tracking logic as business requirements emerge.
 */

import { HttpInterceptorFn } from '@angular/common/http';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
