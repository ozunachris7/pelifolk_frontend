import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowUpRight } from 'lucide-angular';
import { dashboardNavigation } from '../../../../../shared/ui/sidebar/navigation';

@Component({
  selector: 'app-overview',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './overview.html',
})
export class Overview {
  protected readonly sections = dashboardNavigation.filter((item) => item.path !== 'overview');
  protected readonly arrowIcon = ArrowUpRight;
}
