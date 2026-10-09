import { HealthNav } from './health-nav';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Plus, ClipboardList, History } from 'lucide-angular';
import { Session } from '../../../core/auth/session';
import { apiError } from '../../../core/http/api-error';
import { Modal } from '../../../shared/ui/modal/modal';
import { hasPermission } from '../../users/domain/access';
import { HealthRepository } from '../infrastructure/health-repository';
import {
  Product,
  TreatmentCatalogs,
  catalogLabel,
  lastTreatmentDay,
  Severity,
  severityLabel,
  AnimalOption,
  CaseDetail,
  CaseStatus,
  HealthCase,
  HealthHistory,
  Observation,
  Page,
  animalLabel,
  statusLabel,
} from '../domain/health';
@Component({
  selector: 'app-health-list',
  imports: [ReactiveFormsModule, DatePipe, LucideAngularModule, Modal, HealthNav],
  templateUrl: './health-list.html',
})
export class HealthList implements OnInit, OnDestroy {
  private readonly session = inject(Session);
  private readonly repo = inject(HealthRepository);
  private readonly fb = inject(FormBuilder);
  protected readonly canRead = computed(() => hasPermission(this.session.user(), 'health:read'));
  protected readonly canWrite = computed(
    () => this.canRead() && hasPermission(this.session.user(), 'health:write'),
  );
  protected readonly tab = signal<'cases' | 'observations'>('cases');
  protected readonly search = signal('');
  protected readonly status = signal('');
  protected readonly cases = signal<Page<HealthCase>>({
    items: [],
    total: 0,
    offset: 0,
    limit: 25,
  });
  protected readonly observations = signal<Page<Observation>>({
    items: [],
    total: 0,
    offset: 0,
    limit: 25,
  });
  protected readonly page = computed(() =>
    this.tab() === 'cases' ? this.cases() : this.observations(),
  );
  protected readonly loading = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');
  protected readonly formKind = signal<'case' | 'observation' | null>(null);
  protected readonly formError = signal('');
  protected readonly options = signal<AnimalOption[]>([]);
  protected readonly optionSearch = signal('');
  protected readonly optionLoading = signal(false);
  protected readonly optionError = signal('');
  protected readonly detailOpen = signal(false);
  protected readonly detail = signal<CaseDetail | null>(null);
  protected readonly detailLoading = signal(false);
  protected readonly detailError = signal('');
  protected readonly historyOpen = signal(false);
  protected readonly history = signal<HealthHistory | null>(null);
  protected readonly historyLoading = signal(false);
  protected readonly historyError = signal('');
  protected readonly label = animalLabel;
  protected readonly statusLabel = statusLabel;
  protected readonly plus = Plus;
  protected readonly clipboard = ClipboardList;
  protected readonly historyIcon = History;
  protected readonly today = new Date().toLocaleDateString('en-CA');
  protected readonly form = this.fb.nonNullable.group({
    animal_id: ['', Validators.required],
    date: [this.today, Validators.required],
    text: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(5000)]],
    notes: ['', Validators.maxLength(5000)],
  });
  protected readonly statusForm = this.fb.nonNullable.group({
    status: ['open' as CaseStatus, Validators.required],
    closed_date: [this.today],
  });
  protected readonly severityLabel = severityLabel;
  protected readonly diagnosisOpen = signal(false);
  protected readonly diagnosisError = signal('');
  protected readonly diagnosisForm = this.fb.nonNullable.group({
    date: [this.today, Validators.required],
    diagnosis: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(5000)]],
    severity: ['mild' as Severity, Validators.required],
  });
  protected openDiagnosis() {
    const detail = this.detail();
    if (!detail || detail.case.status === 'closed' || !this.canWrite() || this.busy()) return;
    this.closeTreatment();
    this.diagnosisForm.reset({ date: this.today, diagnosis: '', severity: 'mild' });
    this.diagnosisError.set('');
    this.diagnosisOpen.set(true);
  }
  protected async saveDiagnosis() {
    this.diagnosisForm.markAllAsTouched();
    const detail = this.detail();
    if (!detail || this.diagnosisForm.invalid || !this.canWrite() || this.busy()) return;
    const values = this.diagnosisForm.getRawValue();
    if (values.date < detail.case.start_date || values.date > this.today) {
      this.diagnosisError.set('La fecha debe estar entre el inicio del caso y hoy.');
      return;
    }
    this.busy.set(true);
    this.diagnosisError.set('');
    try {
      await this.repo.createDiagnosis(detail.case.id, {
        ...values,
        diagnosis: values.diagnosis.trim(),
      });
      if (this.destroyed) return;
      await this.openDetail(detail.case.id);
      this.success.set('Diagnóstico registrado.');
    } catch (error) {
      if (!this.destroyed)
        this.diagnosisError.set(apiError(error, 'No se pudo registrar el diagnóstico.'));
    } finally {
      if (!this.destroyed) this.busy.set(false);
    }
  }
  protected readonly treatmentOpen = signal(false);
  protected readonly treatmentError = signal('');
  protected readonly treatmentLoading = signal(false);
  protected readonly treatmentCatalogs = signal<TreatmentCatalogs | null>(null);
  protected readonly treatmentProducts = signal<Product[]>([]);
  protected readonly productSearch = signal('');
  protected readonly productLoading = signal(false);
  protected readonly productError = signal('');
  protected readonly catalogLabel = catalogLabel;
  protected readonly lastTreatmentDay = lastTreatmentDay;
  protected readonly treatmentForm = this.fb.nonNullable.group({
    product_id: ['', Validators.required],
    start_date: [this.today, Validators.required],
    dose_value: [
      0,
      [
        Validators.required,
        Validators.min(0.001),
        Validators.max(9999999.999),
        Validators.pattern(/^\d+(\.\d{1,3})?$/),
      ],
    ],
    dose_unit_id: [0, Validators.min(1)],
    route_id: [0, Validators.min(1)],
    frequency_hours: [
      '',
      [Validators.pattern(/^\d+$/), Validators.min(1), Validators.max(2147483647)],
    ],
    duration_days: [
      1,
      [Validators.required, Validators.min(1), Validators.max(3650), Validators.pattern(/^\d+$/)],
    ],
  });
  private treatmentRequest = 0;
  private productRequest = 0;
  protected async openTreatment() {
    const detail = this.detail();
    if (!detail || detail.case.status === 'closed' || !this.canWrite() || this.busy()) return;
    this.diagnosisOpen.set(false);
    this.treatmentOpen.set(true);
    this.treatmentError.set('');
    this.treatmentCatalogs.set(null);
    this.treatmentProducts.set([]);
    this.productSearch.set('');
    this.treatmentForm.reset({
      product_id: '',
      start_date: this.today,
      dose_value: 0,
      dose_unit_id: 0,
      route_id: 0,
      frequency_hours: '',
      duration_days: 1,
    });
    const request = ++this.treatmentRequest;
    this.treatmentLoading.set(true);
    void this.loadTreatmentProducts();
    try {
      const catalogs = await this.repo.catalogs();
      if (request === this.treatmentRequest) this.treatmentCatalogs.set(catalogs);
    } catch (error) {
      if (request === this.treatmentRequest)
        this.treatmentError.set(
          apiError(
            error,
            'No se pudieron cargar las unidades y vías. Cierra y vuelve a abrir el formulario.',
          ),
        );
    } finally {
      if (request === this.treatmentRequest) this.treatmentLoading.set(false);
    }
  }
  protected closeTreatment() {
    if (!this.busy()) {
      this.treatmentRequest++;
      this.productRequest++;
      this.treatmentOpen.set(false);
    }
  }
  protected async loadTreatmentProducts() {
    const request = ++this.productRequest;
    this.productLoading.set(true);
    this.productError.set('');
    try {
      const page = await this.repo.products(this.productSearch().trim(), true, 0, 100);
      if (request === this.productRequest) this.treatmentProducts.set(page.items);
    } catch (error) {
      if (request === this.productRequest)
        this.productError.set(apiError(error, 'No se pudieron cargar los productos.'));
    } finally {
      if (request === this.productRequest) this.productLoading.set(false);
    }
  }
  protected async saveTreatment() {
    this.treatmentForm.markAllAsTouched();
    const detail = this.detail();
    if (
      !detail ||
      this.treatmentForm.invalid ||
      !this.treatmentCatalogs() ||
      !this.canWrite() ||
      this.busy()
    )
      return;
    const values = this.treatmentForm.getRawValue();
    if (values.start_date < detail.case.start_date || values.start_date > this.today) {
      this.treatmentError.set('El inicio debe estar entre la fecha de apertura del caso y hoy.');
      return;
    }
    this.busy.set(true);
    this.treatmentError.set('');
    try {
      await this.repo.createTreatment(detail.case.id, {
        ...values,
        frequency_hours: values.frequency_hours ? Number(values.frequency_hours) : null,
      });
      if (this.destroyed) return;
      await this.openDetail(detail.case.id);
      await this.load(this.page().offset);
      this.success.set('Tratamiento registrado.');
    } catch (error) {
      if (!this.destroyed)
        this.treatmentError.set(apiError(error, 'No se pudo registrar el tratamiento.'));
    } finally {
      if (!this.destroyed) this.busy.set(false);
    }
  }
  private request = 0;
  private optionsRequest = 0;
  private detailRequest = 0;
  private historyRequest = 0;
  private destroyed = false;
  ngOnInit() {
    void this.load();
  }
  ngOnDestroy() {
    this.destroyed = true;
    this.treatmentRequest++;
    this.productRequest++;
    this.request++;
    this.optionsRequest++;
    this.detailRequest++;
    this.historyRequest++;
  }
  protected switchTab(tab: 'cases' | 'observations') {
    this.tab.set(tab);
    void this.load();
  }
  protected async load(offset = 0) {
    if (!this.canRead()) return;
    const request = ++this.request;
    const tab = this.tab();
    this.loading.set(true);
    this.error.set('');
    try {
      if (tab === 'cases') {
        const page = await this.repo.cases(this.search().trim(), this.status(), offset);
        if (request === this.request) this.cases.set(page);
      } else {
        const page = await this.repo.observations(this.search().trim(), offset);
        if (request === this.request) this.observations.set(page);
      }
    } catch (error) {
      if (request === this.request) this.error.set(apiError(error, 'No se pudo cargar Sanidad.'));
    } finally {
      if (request === this.request) this.loading.set(false);
    }
  }
  protected openForm(kind: 'case' | 'observation') {
    if (!this.canWrite() || this.busy()) return;
    this.formKind.set(kind);
    this.formError.set('');
    this.optionSearch.set('');
    this.options.set([]);
    this.form.controls.text.setValidators([
      Validators.required,
      Validators.pattern(/\S/),
      Validators.maxLength(kind === 'case' ? 255 : 5000),
    ]);
    this.form.reset({ animal_id: '', date: this.today, text: '', notes: '' });
    void this.loadOptions();
  }
  protected closeForm() {
    if (!this.busy()) {
      this.formKind.set(null);
      this.optionsRequest++;
    }
  }
  protected async loadOptions() {
    const request = ++this.optionsRequest;
    this.optionLoading.set(true);
    this.optionError.set('');
    try {
      const options = await this.repo.options(this.optionSearch().trim());
      if (request === this.optionsRequest) this.options.set(options);
    } catch (error) {
      if (request === this.optionsRequest)
        this.optionError.set(apiError(error, 'No se pudieron cargar los animales.'));
    } finally {
      if (request === this.optionsRequest) this.optionLoading.set(false);
    }
  }
  protected async save() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy() || !this.canWrite()) return;
    const data = this.form.getRawValue(),
      kind = this.formKind();
    if (!kind) return;
    if (data.date > this.today) {
      this.formError.set('La fecha no puede ser futura.');
      return;
    }
    this.busy.set(true);
    this.formError.set('');
    try {
      if (kind === 'case')
        await this.repo.createCase({
          animal_id: data.animal_id,
          start_date: data.date,
          reason: data.text.trim(),
          notes: data.notes.trim() || null,
        });
      else
        await this.repo.createObservation({
          animal_id: data.animal_id,
          date: data.date,
          observation: data.text.trim(),
        });
      if (this.destroyed) return;
      this.formKind.set(null);
      this.success.set(kind === 'case' ? 'Caso sanitario abierto.' : 'Observación registrada.');
      this.tab.set(kind === 'case' ? 'cases' : 'observations');
      await this.load();
    } catch (error) {
      if (!this.destroyed) this.formError.set(apiError(error, 'No se pudo guardar el registro.'));
    } finally {
      if (!this.destroyed) this.busy.set(false);
    }
  }
  protected async openDetail(caseId: string) {
    this.treatmentRequest++;
    this.productRequest++;
    this.treatmentOpen.set(false);
    this.diagnosisOpen.set(false);
    this.diagnosisError.set('');
    const request = ++this.detailRequest;
    this.detailOpen.set(true);
    this.detail.set(null);
    this.detailLoading.set(true);
    this.detailError.set('');
    try {
      const detail = await this.repo.detail(caseId);
      if (request === this.detailRequest) {
        this.detail.set(detail);
        this.statusForm.reset({ status: detail.case.status, closed_date: this.today });
      }
    } catch (error) {
      if (request === this.detailRequest)
        this.detailError.set(apiError(error, 'No se pudo cargar el caso.'));
    } finally {
      if (request === this.detailRequest) this.detailLoading.set(false);
    }
  }
  protected closeDetail() {
    if (!this.busy()) {
      this.detailRequest++;
      this.treatmentRequest++;
      this.productRequest++;
      this.detailOpen.set(false);
    }
  }
  protected async updateStatus() {
    const detail = this.detail();
    if (!detail || !this.canWrite() || this.busy()) return;
    const values = this.statusForm.getRawValue();
    this.detailError.set('');
    if (values.status === detail.case.status) return;
    if (
      values.status === 'closed' &&
      (!values.closed_date ||
        values.closed_date < detail.case.start_date ||
        values.closed_date > this.today)
    ) {
      this.detailError.set('El cierre debe estar entre la fecha de inicio y hoy.');
      return;
    }
    this.busy.set(true);
    try {
      await this.repo.status(detail.case.id, {
        expected_status: detail.case.status,
        status: values.status,
        closed_date: values.status === 'closed' ? values.closed_date : null,
      });
      if (this.destroyed) return;
      await this.openDetail(detail.case.id);
      await this.load(this.page().offset);
      this.success.set('Estado del caso actualizado.');
    } catch (error) {
      if (!this.destroyed) this.detailError.set(apiError(error, 'No se pudo actualizar el caso.'));
    } finally {
      if (!this.destroyed) this.busy.set(false);
    }
  }
  protected async openHistory(animal: AnimalOption) {
    const request = ++this.historyRequest;
    this.historyOpen.set(true);
    this.history.set(null);
    this.historyLoading.set(true);
    this.historyError.set('');
    try {
      const history = await this.repo.history(animal.id);
      if (request === this.historyRequest) this.history.set(history);
    } catch (error) {
      if (request === this.historyRequest)
        this.historyError.set(apiError(error, 'No se pudo cargar el historial sanitario.'));
    } finally {
      if (request === this.historyRequest) this.historyLoading.set(false);
    }
  }
  protected closeHistory() {
    this.historyRequest++;
    this.historyOpen.set(false);
  }
  protected viewHistoryCase(id: string) {
    this.closeHistory();
    void this.openDetail(id);
  }
}
