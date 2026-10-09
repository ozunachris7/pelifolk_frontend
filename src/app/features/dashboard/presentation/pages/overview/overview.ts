import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowUpRight } from 'lucide-angular';
import { navigationFor } from '../../../../../shared/ui/sidebar/navigation';
import { Session } from '../../../../../core/auth/session';

@Component({
  selector: 'app-overview',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './overview.html',
})
export class Overview {
  private readonly session = inject(Session);
  protected readonly sections = computed(() =>
    navigationFor(this.session.user()?.permissions ?? []).filter(
      (item) => item.path !== 'overview',
    ),
  );
  protected readonly arrowIcon = ArrowUpRight;
}
