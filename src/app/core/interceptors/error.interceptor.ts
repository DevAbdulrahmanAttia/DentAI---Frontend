/**
 * Error Interceptor
 *
 * Functional HTTP interceptor for error handling.
 * Extended with error handling logic as business requirements emerge.
 */

import { HttpInterceptorFn } from '@angular/common/http';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
