import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Session } from '../auth/session';
import { API_URL } from './api-url';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const api = inject(API_URL);
  if (!request.url.startsWith(`${api}/`) || request.url === `${api}/auth/login`)
    return next(request);
  const session = inject(Session);
  const router = inject(Router);
  const token = session.getAccessToken();
  const authorized = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;
  return next(authorized).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && !request.url.startsWith(`${api}/auth/`)) {
        const currentToken = session.getAccessToken();
        if (error.status === 401 && (!currentToken || currentToken === token)) {
          session.invalidate();
          void router.navigate(['/login'], {
            queryParams: { reason: 'expired', returnUrl: router.url },
            replaceUrl: true,
          });
        } else if (error.status === 403 && currentToken === token && token) {
          // Role permissions can change while the token remains valid.
          void session.isAuthenticated(true).then((valid) => {
            if (!valid) void router.navigate(['/login'], { replaceUrl: true });
          });
        }
      }
      return throwError(() => error);
    }),
  );
};
