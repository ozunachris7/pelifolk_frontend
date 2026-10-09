import { Component, computed, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { navigationFor } from './navigation';
import { Session } from '../../../core/auth/session';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  readonly navigate = output<void>();
  private readonly session = inject(Session);
  protected readonly items = computed(() => navigationFor(this.session.user()?.permissions ?? []));
}
