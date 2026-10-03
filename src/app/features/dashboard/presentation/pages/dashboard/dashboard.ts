import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LucideAngularModule, Menu, X } from 'lucide-angular';
import { Header } from '../../../../../shared/ui/header/header';
import { Sidebar } from '../../../../../shared/ui/sidebar/sidebar';
import { Session } from '../../../../../core/auth/session';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, Header, Sidebar, LucideAngularModule],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly router = inject(Router);
  protected readonly session = inject(Session);
  protected readonly sidebarOpen = signal(false);
  protected readonly menuIcon = Menu;
  protected readonly closeIcon = X;

  protected logout(): void {
    this.session.logout();
    this.sidebarOpen.set(false);
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
