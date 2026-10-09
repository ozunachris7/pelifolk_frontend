import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../http/api-url';
import { Session, SessionUser } from './session';

const USER: SessionUser = {
  id: 'user-id',
  name: 'Juan',
  middle_name: 'Carlos',
  paternal_lastname: 'Lopez',
  maternal_lastname: 'Perez',
  email: 'juan@example.com',
  phone: null,
  active: true,
  role_id: 'role-id',
  role_name: 'worker',
  permissions: [],
};

describe('Session API integration', () => {
  beforeEach(() => {
    sessionStorage.removeItem('pelifolk-session');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    sessionStorage.removeItem('pelifolk-session');
  });

  it('sends credentials to the API and stores the token without the password', async () => {
    const session = TestBed.inject(Session);
    const login = session.login(' JUAN@example.com ', 'Exact password ');
    const request = TestBed.inject(HttpTestingController).expectOne(
      `${TestBed.inject(API_URL)}/auth/login`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: USER.email, password: 'Exact password ' });
    expect(session.user()).toBeNull();
    request.flush({
      access_token: 'api-token',
      token_type: 'bearer',
      expires_in: 1800,
      user: USER,
    });
    await login;
    expect(session.user()).toEqual(USER);
    expect(await session.isAuthenticated()).toBe(true);
    const stored = sessionStorage.getItem('pelifolk-session')!;
    expect(JSON.parse(stored).accessToken).toBe('api-token');
    expect(stored).not.toContain('Exact password');
    expect(stored).not.toContain(USER.email);
  });

  it('does not create a session when credentials are rejected', async () => {
    const session = TestBed.inject(Session);
    const login = session.login(USER.email, 'invalid');
    const rejected = expect(login).rejects.toMatchObject({ status: 401 });
    TestBed.inject(HttpTestingController)
      .expectOne(`${TestBed.inject(API_URL)}/auth/login`)
      .flush({ detail: 'Invalid email or password' }, { status: 401, statusText: 'Unauthorized' });
    await rejected;
    expect(session.user()).toBeNull();
    expect(sessionStorage.getItem('pelifolk-session')).toBeNull();
  });

  it('restores a stored token by validating it with the server once for concurrent guards', async () => {
    sessionStorage.setItem(
      'pelifolk-session',
      JSON.stringify({ accessToken: 'saved-token', expiresAt: Date.now() + 60_000 }),
    );
    const session = TestBed.inject(Session);
    expect(session.user()).toBeNull();
    const first = session.isAuthenticated();
    const second = session.isAuthenticated();
    const request = TestBed.inject(HttpTestingController).expectOne(
      `${TestBed.inject(API_URL)}/auth/me`,
    );
    expect(request.request.headers.get('Authorization')).toBe('Bearer saved-token');
    request.flush(USER);
    expect(await first).toBe(true);
    expect(await second).toBe(true);
    expect(session.user()).toEqual(USER);
  });

  it('clears a revoked token when session validation fails', async () => {
    sessionStorage.setItem(
      'pelifolk-session',
      JSON.stringify({ accessToken: 'revoked-token', expiresAt: Date.now() + 60_000 }),
    );
    const session = TestBed.inject(Session);
    const validation = session.isAuthenticated();
    TestBed.inject(HttpTestingController)
      .expectOne(`${TestBed.inject(API_URL)}/auth/me`)
      .flush({ detail: 'Invalid token' }, { status: 401, statusText: 'Unauthorized' });
    expect(await validation).toBe(false);
    expect(session.user()).toBeNull();
    expect(sessionStorage.getItem('pelifolk-session')).toBeNull();
  });

  it('rejects old demo sessions without making requests', async () => {
    sessionStorage.setItem(
      'pelifolk-session',
      JSON.stringify({ id: 'admin', name: 'Administrador' }),
    );
    expect(await TestBed.inject(Session).isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem('pelifolk-session')).toBeNull();
  });

  it('rejects expired tokens without making requests', async () => {
    sessionStorage.setItem(
      'pelifolk-session',
      JSON.stringify({ accessToken: 'expired-token', expiresAt: Date.now() - 1000 }),
    );
    expect(await TestBed.inject(Session).isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem('pelifolk-session')).toBeNull();
  });

  it('clears the local session and sends the bearer token on logout even if the server fails', async () => {
    const session = TestBed.inject(Session);
    const login = session.login(USER.email, 'Created password');
    TestBed.inject(HttpTestingController)
      .expectOne(`${TestBed.inject(API_URL)}/auth/login`)
      .flush({ access_token: 'api-token', token_type: 'bearer', expires_in: 1800, user: USER });
    await login;
    session.logout();
    expect(session.user()).toBeNull();
    expect(sessionStorage.getItem('pelifolk-session')).toBeNull();
    const request = TestBed.inject(HttpTestingController).expectOne(
      `${TestBed.inject(API_URL)}/auth/logout`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer api-token');
    request.error(new ProgressEvent('error'));
  });
});
