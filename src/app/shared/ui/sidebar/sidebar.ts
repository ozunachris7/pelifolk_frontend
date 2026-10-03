import { Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { dashboardNavigation } from './navigation';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  readonly navigate = output<void>();
  protected readonly items = dashboardNavigation;
}
