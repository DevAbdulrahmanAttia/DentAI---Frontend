/**
 * Authentication Interceptor
 *
 * Functional HTTP interceptor for request authentication.
 * Adds authorization headers to outgoing requests.
 * Extend with token attachment logic as authentication is implemented.
 */

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: Implement token attachment logic
  // const token = this.authService.getToken();
  // if (token) {
  //   req = req.clone({
  //     setHeaders: { Authorization: `Bearer ${token}` }
  //   });
  // }
  return next(req);
};
