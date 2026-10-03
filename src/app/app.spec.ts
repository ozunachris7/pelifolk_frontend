import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { Session } from './core/auth/session';

describe('App', () => {
  beforeEach(async () => {
    sessionStorage.removeItem('pelifolk-session');
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  afterEach(() => sessionStorage.removeItem('pelifolk-session'));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the dashboard and navigate to a section', async () => {
    TestBed.inject(Session).login('admin@pelifolk.com', 'Pelifolk2026');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(router.url).toBe('/dashboard/overview');
    expect(compiled.querySelector('app-header header a')?.getAttribute('aria-label')).toBe(
      'Pelifolk, inicio',
    );
    expect(compiled.querySelector('main h1')?.textContent).toBe('Resumen del rancho');
    const animalsLink = compiled.querySelector<HTMLAnchorElement>(
      'app-sidebar a[href="/dashboard/animals"]',
    );
    expect(animalsLink).toBeTruthy();
    animalsLink!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/dashboard/animals');
    expect(compiled.querySelector('main h1')?.textContent).toBe('Animales');
    expect(animalsLink!.getAttribute('aria-current')).toBe('page');
  });

  it('should switch themes and sign out from the profile dropdown', async () => {
    const previousTheme = localStorage.getItem('pelifolk-theme');
    const previousDark = document.documentElement.classList.contains('dark');
    try {
      document.documentElement.classList.remove('dark');
      const session = TestBed.inject(Session);
      session.setUser({ id: 'test-user', name: 'Usuario de prueba' });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      await TestBed.inject(Router).navigateByUrl('/dashboard/overview');
      await fixture.whenStable();
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;
      element.querySelector<HTMLButtonElement>('button[aria-label="Activar modo oscuro"]')!.click();
      fixture.detectChanges();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('pelifolk-theme')).toBe('dark');
      element.querySelector<HTMLButtonElement>('button[aria-label="Activar modo claro"]')!.click();
      fixture.detectChanges();
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      const profile = element.querySelector<HTMLButtonElement>(
        'button[aria-label="Opciones de usuario"]',
      )!;
      profile.click();
      fixture.detectChanges();
      expect(element.querySelector('#profile-options')?.textContent).toContain('Usuario de prueba');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(profile.getAttribute('aria-expanded')).toBe('false');
      profile.click();
      fixture.detectChanges();
      element.querySelector<HTMLButtonElement>('#profile-options button')!.click();
      fixture.detectChanges();
      expect(session.user()).toBeNull();
      expect(element.querySelector('#profile-options')).toBeNull();
      await fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe('/login');
    } finally {
      document.documentElement.classList.toggle('dark', previousDark);
      if (previousTheme === null) localStorage.removeItem('pelifolk-theme');
      else localStorage.setItem('pelifolk-theme', previousTheme);
    }
  });

  it('should require login, reject invalid credentials and return to the requested section', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/dashboard/animals');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toContain('/login');
    const element = fixture.nativeElement as HTMLElement;
    const fill = (id: string, value: string) => {
      const input = element.querySelector<HTMLInputElement>(`#${id}`)!;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    fill('email', 'admin@pelifolk.com');
    fill('password', 'incorrect');
    element
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('incorrectos');
    expect(TestBed.inject(Session).user()).toBeNull();
    fill('password', 'Pelifolk2026');
    element
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/dashboard/animals');
    expect(TestBed.inject(Session).user()?.name).toBe('Administrador');
    expect(sessionStorage.getItem('pelifolk-session')).not.toContain('Pelifolk2026');
    await router.navigateByUrl('/login');
    expect(router.url).toBe('/dashboard/overview');
  });
});
