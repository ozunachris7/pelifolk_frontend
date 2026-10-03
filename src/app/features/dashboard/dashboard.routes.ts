import { Routes } from '@angular/router';
import { dashboardNavigation } from '../../shared/ui/sidebar/navigation';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/pages/dashboard/dashboard').then((m) => m.Dashboard),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        title: 'Resumen | Pelifolk',
        loadComponent: () =>
          import('./presentation/pages/overview/overview').then((m) => m.Overview),
      },
      ...dashboardNavigation
        .filter((item) => item.path !== 'overview')
        .map((item) => ({
          path: item.path,
          title: `${item.label} | Pelifolk`,
          data: { title: item.label, description: item.description },
          loadComponent: () =>
            import('../../shared/ui/section-placeholder/section-placeholder').then(
              (m) => m.SectionPlaceholder,
            ),
        })),
      { path: '**', redirectTo: 'overview' },
    ],
  },
];
