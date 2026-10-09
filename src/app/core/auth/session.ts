import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { API_URL } from '../http/api-url';

const SESSION_KEY = 'pelifolk-session';
const REQUEST_TIMEOUT = 15_000;

export interface SessionUser {
  id: string;
  name: string;
  middle_name: string | null;
  paternal_lastname: string;
  maternal_lastname: string;
  email: string;
  phone: string | null;
  active: boolean;
  role_id: string;
  role_name: string;
  permissions: string[];
  photoUrl?: string | null;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: SessionUser;
}

interface StoredSession {
  accessToken: string;
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class Session {
  private readonly document = inject(DOCUMENT);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly restored = this.restoreSession();
  private accessToken: string | null = this.restored?.accessToken ?? null;
  private expiresAt = this.restored?.expiresAt ?? 0;
  private validation: Promise<boolean> | null = null;
  private readonly userState = signal<SessionUser | null>(null);
  readonly user = this.userState.asReadonly();

  getAccessToken(): string | null {
    if (this.accessToken && Date.now() >= this.expiresAt) this.clearSession();
    return this.accessToken;
  }

  invalidate(): void {
    this.clearSession();
  }

  updateIdentity(user: SessionUser): void {
    if (this.accessToken && this.userState()?.id === user.id) this.userState.set(user);
  }

  async login(email: string, password: string): Promise<void> {
    this.clearSession();
    const response = await firstValueFrom(
      this.http
        .post<LoginResponse>(`${this.apiUrl}/auth/login`, {
          email: email.trim().toLowerCase(),
          password,
        })
        .pipe(timeout(REQUEST_TIMEOUT)),
    );
    this.accessToken = response.access_token;
    this.expiresAt = Date.now() + response.expires_in * 1000;
    this.userState.set(response.user);
    this.persistSession();
  }

  async isAuthenticated(refresh = false): Promise<boolean> {
    if (!this.accessToken || Date.now() >= this.expiresAt) {
      this.clearSession();
      return false;
    }
    if (this.userState() && !refresh) return true;
    if (this.validation) return this.validation;
    const token = this.accessToken;
    this.validation = firstValueFrom(
      this.http
        .get<SessionUser>(`${this.apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .pipe(timeout(REQUEST_TIMEOUT)),
    )
      .then((user) => {
        if (token !== this.accessToken) return false;
        this.userState.set(user);
        return true;
      })
      .catch(() => {
        if (token === this.accessToken) this.clearSession();
        return false;
      })
      .finally(() => {
        this.validation = null;
      });
    return this.validation;
  }

  logout(): void {
    const token = this.accessToken;
    this.clearSession();
    if (token) {
      void firstValueFrom(
        this.http
          .post<void>(`${this.apiUrl}/auth/logout`, null, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .pipe(timeout(REQUEST_TIMEOUT)),
      ).catch(() => {
        // Local logout remains effective if the server is unavailable.
      });
    }
  }

  private clearSession(): void {
    this.accessToken = null;
    this.expiresAt = 0;
    this.userState.set(null);
    this.persistSession();
  }

  private persistSession(): void {
    try {
      const storage = this.document.defaultView?.sessionStorage;
      if (this.accessToken) {
        storage?.setItem(
          SESSION_KEY,
          JSON.stringify({ accessToken: this.accessToken, expiresAt: this.expiresAt }),
        );
      } else {
        storage?.removeItem(SESSION_KEY);
      }
    } catch {
      // Session remains usable in memory if storage is unavailable.
    }
  }

  private restoreSession(): StoredSession | null {
    try {
      const storage = this.document.defaultView?.sessionStorage;
      const stored = storage?.getItem(SESSION_KEY);
      if (!stored) return null;
      const session = JSON.parse(stored);
      if (
        typeof session?.accessToken === 'string' &&
        session.accessToken.length > 0 &&
        typeof session.expiresAt === 'number' &&
        Number.isFinite(session.expiresAt) &&
        session.expiresAt > Date.now()
      ) {
        return { accessToken: session.accessToken, expiresAt: session.expiresAt };
      }
      storage?.removeItem(SESSION_KEY);
    } catch {
      // Invalid or unavailable storage does not create an authenticated session.
    }
    return null;
  }
}
