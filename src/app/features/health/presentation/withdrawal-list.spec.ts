import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Session } from '../../../core/auth/session';
import { WithdrawalList } from './withdrawal-list';
const row = {
  animal: { id: 'a1', name: 'Luna', siniiga: 'MX1' },
  status: 'unknown',
  release_date: null,
  treatment_count: 1,
  unknown_count: 1,
  in_treatment: false,
};
describe('Health withdrawals', () => {
  let permissions: string[];
  beforeEach(async () => {
    permissions = ['health:read'];
    await TestBed.configureTestingModule({
      imports: [WithdrawalList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Session, useValue: { user: () => ({ permissions }) } },
      ],
    }).compileComponents();
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('shows unknown historical periods and the recorded treatment detail', async () => {
    const f = TestBed.createComponent(WithdrawalList);
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((r) => r.url.endsWith('/health/withdrawals'))
      .flush({ items: [row], total: 1, offset: 0, limit: 25 });
    await expect
      .poll(() => {
        f.detectChanges();
        return f.nativeElement.textContent;
      })
      .toContain('Periodo por verificar');
    f.nativeElement.querySelector('tbody button').click();
    f.detectChanges();
    http
      .expectOne((r) => r.url.endsWith('/animals/a1/withdrawal'))
      .flush({
        ...row,
        items: [
          {
            event_id: 't1',
            product_name: 'Producto registrado',
            start_date: '2024-01-03',
            last_day: '2024-01-05',
            withdrawal_days: null,
            release_date: null,
            status: 'unknown',
          },
        ],
      });
    await expect
      .poll(() => {
        f.detectChanges();
        return f.nativeElement.querySelector('dialog')?.textContent;
      })
      .toContain('Periodo guardado: Por verificar');
  });
  it('makes no health requests without permission', () => {
    permissions = [];
    const f = TestBed.createComponent(WithdrawalList);
    f.detectChanges();
    TestBed.inject(HttpTestingController).expectNone((r) => r.url.includes('/health/'));
    expect(f.nativeElement.textContent).toContain('No tienes permiso');
  });
});
