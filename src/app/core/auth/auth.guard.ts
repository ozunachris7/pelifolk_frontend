import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { Session } from './session';

export const authGuard: CanActivateFn = (_route, state) =>
  inject(Session).user() !== null ||
  inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });

export const authChildGuard: CanActivateChildFn = authGuard;

export const guestGuard: CanActivateFn = () =>
  inject(Session).user() === null || inject(Router).createUrlTree(['/dashboard/overview']);
