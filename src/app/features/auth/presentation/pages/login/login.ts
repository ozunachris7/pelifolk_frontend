import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArrowRight, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';
import { Session } from '../../../../../core/auth/session';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly showPassword = signal(false);
  protected readonly error = signal('');
  protected readonly submitting = signal(false);
  protected readonly eyeIcon = Eye;
  protected readonly eyeOffIcon = EyeOff;
  protected readonly arrowIcon = ArrowRight;
  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected async submit(): Promise<void> {
    if (this.submitting()) return;
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    if (!this.session.login(email, password)) {
      this.error.set('El correo o la contraseña son incorrectos.');
      return;
    }
    this.submitting.set(true);
    const requested = this.route.snapshot.queryParamMap.get('returnUrl');
    const destination =
      requested && (requested === '/dashboard' || requested.startsWith('/dashboard/'))
        ? requested
        : '/dashboard/overview';
    try {
      await this.router.navigateByUrl(destination, { replaceUrl: true });
    } finally {
      this.submitting.set(false);
    }
  }
}
