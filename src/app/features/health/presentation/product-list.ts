import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Plus, Pencil } from 'lucide-angular';
import { Session } from '../../../core/auth/session';
import { apiError } from '../../../core/http/api-error';
import { Modal } from '../../../shared/ui/modal/modal';
import { hasPermission } from '../../users/domain/access';
import { HealthRepository } from '../infrastructure/health-repository';
import { Page, Product, TreatmentCatalogs, catalogLabel } from '../domain/health';
import { HealthNav } from './health-nav';
@Component({
  selector: 'app-product-list',
  imports: [ReactiveFormsModule, LucideAngularModule, Modal, HealthNav],
  templateUrl: './product-list.html',
})
export class ProductList implements OnInit, OnDestroy {
  private readonly session = inject(Session);
  private readonly repo = inject(HealthRepository);
  private readonly fb = inject(FormBuilder);
  protected readonly canRead = computed(() => hasPermission(this.session.user(), 'health:read'));
  protected readonly canWrite = computed(
    () => this.canRead() && hasPermission(this.session.user(), 'health:write'),
  );
  protected readonly page = signal<Page<Product>>({ items: [], total: 0, offset: 0, limit: 25 });
  protected readonly search = signal('');
  protected readonly status = signal('active');
  protected readonly loading = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');
  protected readonly formOpen = signal(false);
  protected readonly formError = signal('');
  protected readonly editing = signal<Product | null>(null);
  protected readonly catalogs = signal<TreatmentCatalogs | null>(null);
  protected readonly catalogLoading = signal(false);
  protected readonly label = catalogLabel;
  protected readonly plus = Plus;
  protected readonly pencil = Pencil;
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)]],
    product_type_id: [0, Validators.min(1)],
    unit_id: [0, Validators.min(1)],
    withdrawal_days: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(2147483647),
        Validators.pattern(/^\d+$/),
      ],
    ],
    active: [true],
  });
  private request = 0;
  private formRequest = 0;
  private destroyed = false;
  ngOnInit() {
    void this.load();
  }
  ngOnDestroy() {
    this.destroyed = true;
    this.request++;
    this.formRequest++;
  }
  protected async load(offset = 0) {
    if (!this.canRead()) return;
    const request = ++this.request;
    this.loading.set(true);
    this.error.set('');
    try {
      const page = await this.repo.products(
        this.search().trim(),
        this.status() === 'all' ? null : this.status() === 'active',
        offset,
      );
      if (request === this.request) this.page.set(page);
    } catch (error) {
      if (request === this.request)
        this.error.set(apiError(error, 'No se pudieron cargar los productos.'));
    } finally {
      if (request === this.request) this.loading.set(false);
    }
  }
  protected async openForm(product: Product | null = null) {
    if (!this.canWrite() || this.busy()) return;
    const request = ++this.formRequest;
    this.editing.set(product);
    this.formError.set('');
    this.catalogs.set(null);
    this.catalogLoading.set(true);
    this.form.reset({
      name: product?.name ?? '',
      product_type_id: product?.product_type_id ?? 0,
      unit_id: product?.unit_id ?? 0,
      withdrawal_days: product?.withdrawal_days ?? 0,
      active: product?.active ?? true,
    });
    this.formOpen.set(true);
    try {
      const catalogs = await this.repo.catalogs();
      if (request === this.formRequest) this.catalogs.set(catalogs);
    } catch (error) {
      if (request === this.formRequest)
        this.formError.set(
          apiError(
            error,
            'No se pudieron cargar los catálogos. Cierra y vuelve a abrir el formulario.',
          ),
        );
    } finally {
      if (request === this.formRequest) this.catalogLoading.set(false);
    }
  }
  protected closeForm() {
    if (!this.busy()) {
      this.formRequest++;
      this.formOpen.set(false);
    }
  }
  protected async save() {
    this.form.markAllAsTouched();
    if (!this.canWrite() || this.busy() || this.form.invalid || !this.catalogs()) return;
    this.busy.set(true);
    this.formError.set('');
    try {
      const data = this.form.getRawValue();
      await this.repo.saveProduct({ ...data, name: data.name.trim() }, this.editing()?.id);
      if (this.destroyed) return;
      this.formOpen.set(false);
      this.success.set(this.editing() ? 'Producto actualizado.' : 'Producto registrado.');
      await this.load();
    } catch (error) {
      if (!this.destroyed) this.formError.set(apiError(error, 'No se pudo guardar el producto.'));
    } finally {
      if (!this.destroyed) this.busy.set(false);
    }
  }
}
