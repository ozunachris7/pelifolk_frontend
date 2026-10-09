import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Plus, History } from 'lucide-angular';
import { Session } from '../../../core/auth/session';
import { apiError } from '../../../core/http/api-error';
import { Modal } from '../../../shared/ui/modal/modal';
import { hasPermission } from '../../users/domain/access';
import { ExitRepository } from '../infrastructure/exit-repository';
import {
  ExitAnimal,
  ExitHistory,
  ExitPage,
  ExitRecord,
  ExitType,
  animalLabel,
  exitLabel,
  exitTypes,
} from '../domain/exits';
@Component({
  selector: 'app-exit-list',
  imports: [DatePipe, ReactiveFormsModule, LucideAngularModule, Modal],
  templateUrl: './exit-list.html',
})
export class ExitList implements OnInit, OnDestroy {
  private readonly session = inject(Session);
  private readonly repo = inject(ExitRepository);
  private readonly fb = inject(FormBuilder);
  protected readonly canRead = computed(() => hasPermission(this.session.user(), 'exits:read'));
  protected readonly canWrite = computed(
    () => this.canRead() && hasPermission(this.session.user(), 'exits:write'),
  );
  protected readonly types = exitTypes;
  protected readonly label = animalLabel;
  protected readonly exitLabel = exitLabel;
  protected readonly plus = Plus;
  protected readonly clock = History;
  protected readonly page = signal<ExitPage>({ items: [], total: 0, offset: 0, limit: 25 });
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');
  protected readonly formOpen = signal(false);
  protected readonly busy = signal(false);
  protected readonly formError = signal('');
  protected readonly options = signal<ExitAnimal[]>([]);
  protected readonly optionSearch = signal('');
  protected readonly optionLoading = signal(false);
  protected readonly optionReady = signal(false);
  protected readonly detail = signal<ExitRecord | null>(null);
  protected readonly historyOpen = signal(false);
  protected readonly history = signal<ExitHistory | null>(null);
  protected readonly historyLoading = signal(false);
  protected readonly historyError = signal('');
  protected readonly today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  protected readonly search = this.fb.nonNullable.group({
    q: ['', Validators.maxLength(100)],
    exit_type: ['' as ExitType | ''],
  });
  protected readonly form = this.fb.nonNullable.group({
    animal_id: ['', Validators.required],
    exit_type: ['sale' as ExitType, Validators.required],
    date: [this.today, Validators.required],
    reason: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(5000)]],
  });
  private listRequest = 0;
  private optionRequest = 0;
  private historyRequest = 0;
  private destroyed = false;
  ngOnInit() {
    void this.load();
  }
  ngOnDestroy() {
    this.destroyed = true;
    this.listRequest++;
    this.optionRequest++;
    this.historyRequest++;
  }
  protected async load(offset = 0) {
    if (!this.canRead() || this.destroyed) return;
    const request = ++this.listRequest;
    this.loading.set(true);
    this.error.set('');
    try {
      const v = this.search.getRawValue();
      const page = await this.repo.list(v.q.trim(), v.exit_type, offset);
      if (request === this.listRequest) this.page.set(page);
    } catch (e) {
      if (request === this.listRequest)
        this.error.set(apiError(e, 'No se pudieron cargar las salidas.'));
    } finally {
      if (request === this.listRequest) this.loading.set(false);
    }
  }
  protected openForm() {
    if (!this.canWrite() || this.busy()) return;
    this.form.reset({ animal_id: '', exit_type: 'sale', date: this.today, reason: '' });
    this.formError.set('');
    this.options.set([]);
    this.optionSearch.set('');
    this.optionReady.set(false);
    this.formOpen.set(true);
    void this.loadOptions();
  }
  protected closeForm() {
    if (!this.busy()) {
      this.optionRequest++;
      this.formOpen.set(false);
    }
  }
  protected async loadOptions() {
    const request = ++this.optionRequest;
    this.optionLoading.set(true);
    this.formError.set('');
    try {
      const options = await this.repo.options(this.optionSearch().trim());
      if (request === this.optionRequest) {
        const selected = this.options().find((a) => a.id === this.form.controls.animal_id.value);
        this.options.set(
          selected && !options.some((a) => a.id === selected.id) ? [selected, ...options] : options,
        );
        this.optionReady.set(true);
      }
    } catch (e) {
      if (request === this.optionRequest) {
        this.optionReady.set(false);
        this.formError.set(apiError(e, 'No se pudieron cargar los animales.'));
      }
    } finally {
      if (request === this.optionRequest) this.optionLoading.set(false);
    }
  }
  protected async save() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy() || !this.canWrite() || !this.optionReady()) return;
    const v = this.form.getRawValue();
    if (v.date > this.today) {
      this.formError.set('La fecha no puede ser futura.');
      return;
    }
    this.busy.set(true);
    this.formError.set('');
    try {
      const saved = await this.repo.create({ ...v, reason: v.reason.trim() });
      if (this.destroyed) return;
      this.optionRequest++;
      this.formOpen.set(false);
      this.success.set('Salida registrada. El animal quedó dado de baja del hato.');
      await this.load();
      this.detail.set(saved);
    } catch (e) {
      if (!this.destroyed) this.formError.set(apiError(e, 'No se pudo registrar la salida.'));
    } finally {
      if (!this.destroyed) this.busy.set(false);
    }
  }
  protected async openHistory(animal: ExitAnimal) {
    const request = ++this.historyRequest;
    this.historyOpen.set(true);
    this.history.set(null);
    this.historyError.set('');
    this.historyLoading.set(true);
    try {
      const history = await this.repo.history(animal.id);
      if (request === this.historyRequest) this.history.set(history);
    } catch (e) {
      if (request === this.historyRequest)
        this.historyError.set(apiError(e, 'No se pudo cargar el historial de salidas.'));
    } finally {
      if (request === this.historyRequest) this.historyLoading.set(false);
    }
  }
  protected closeHistory() {
    this.historyRequest++;
    this.historyOpen.set(false);
  }
}
