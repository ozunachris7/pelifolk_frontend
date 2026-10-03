import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

const SESSION_KEY = 'pelifolk-session';
const ADMIN_USER: SessionUser = { id: 'admin', name: 'Administrador' };

export interface SessionUser {
  id: string;
  name: string;
  photoUrl?: string | null;
}

@Injectable({ providedIn: 'root' })
export class Session {
  private readonly document = inject(DOCUMENT);
  private readonly userState = signal<SessionUser | null>(this.restoreUser());
  readonly user = this.userState.asReadonly();

  setUser(user: SessionUser | null): void {
    this.userState.set(user);
    try {
      const storage = this.document.defaultView?.sessionStorage;
      if (user) storage?.setItem(SESSION_KEY, JSON.stringify(user));
      else storage?.removeItem(SESSION_KEY);
    } catch {
      /* Session remains usable in memory if storage is unavailable. */
    }
  }

  login(email: string, password: string): boolean {
    // Temporary demo authentication. Replace with server authentication before deployment.
    if (email.trim().toLowerCase() !== 'admin@pelifolk.com' || password !== 'Pelifolk2026') {
      return false;
    }
    this.setUser({ ...ADMIN_USER });
    return true;
  }

  logout(): void {
    this.setUser(null);
  }

  private restoreUser(): SessionUser | null {
    try {
      const stored = this.document.defaultView?.sessionStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      const user = JSON.parse(stored);
      return user?.id === ADMIN_USER.id && user?.name === ADMIN_USER.name
        ? { ...ADMIN_USER }
        : null;
    } catch {
      return null;
    }
  }
}
