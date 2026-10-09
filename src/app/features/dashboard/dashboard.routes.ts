import { FinanceRepository } from '../finance/infrastructure/finance-repository';
import { ExitRepository } from '../exits/infrastructure/exit-repository';
import { BreedingRepository } from '../breeding/infrastructure/breeding-repository';
import { HealthRepository } from '../health/infrastructure/health-repository';
import { WeightRepository } from '../weights/infrastructure/weight-repository';
import { Routes } from '@angular/router';
import { dashboardNavigation } from '../../shared/ui/sidebar/navigation';
import { ANIMAL_PROVIDERS } from '../animals/infrastructure/animal-repository';
import { ORGANIZATION_PROVIDERS } from '../organization/infrastructure/organization-repository';
import { ACCESS_PROVIDERS } from '../users/infrastructure/access-repository';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/pages/dashboard/dashboard').then((m) => m.Dashboard),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'animals',
        title: 'Animales | Pelifolk',
        providers: ANIMAL_PROVIDERS,
        loadComponent: () =>
          import('../animals/presentation/animal-list').then((m) => m.AnimalList),
      },
      {
        path: 'breeds',
        title: 'Razas | Pelifolk',
        providers: ANIMAL_PROVIDERS,
        loadComponent: () => import('../animals/presentation/breed-list').then((m) => m.BreedList),
      },
      {
        path: 'locations',
        title: 'Ubicaciones | Pelifolk',
        providers: ORGANIZATION_PROVIDERS,
        loadComponent: () =>
          import('../organization/presentation/location-list').then((m) => m.LocationList),
      },
      {
        path: 'groups',
        title: 'Lotes | Pelifolk',
        providers: ORGANIZATION_PROVIDERS,
        loadComponent: () =>
          import('../organization/presentation/group-list').then((m) => m.GroupList),
      },
      {
        path: 'groups/:id',
        title: 'Animales del lote | Pelifolk',
        providers: ORGANIZATION_PROVIDERS,
        loadComponent: () =>
          import('../organization/presentation/group-detail').then((m) => m.GroupDetail),
      },
      {
        path: 'management',
        title: 'Pesajes | Pelifolk',
        providers: [WeightRepository],
        loadComponent: () =>
          import('../weights/presentation/weight-list').then((m) => m.WeightList),
      },
      {
        path: 'health',
        title: 'Sanidad | Pelifolk',
        providers: [HealthRepository],
        loadComponent: () => import('../health/presentation/health-list').then((m) => m.HealthList),
      },
      {
        path: 'health/products',
        title: 'Productos | Pelifolk',
        providers: [HealthRepository],
        loadComponent: () =>
          import('../health/presentation/product-list').then((m) => m.ProductList),
      },
      {
        path: 'health/programs',
        title: 'Programas sanitarios | Pelifolk',
        providers: [HealthRepository],
        loadComponent: () =>
          import('../health/presentation/program-list').then((m) => m.ProgramList),
      },
      {
        path: 'breeding',
        title: 'Reproducción | Pelifolk',
        providers: [BreedingRepository],
        loadComponent: () =>
          import('../breeding/presentation/breeding-list').then((m) => m.BreedingList),
      },
      {
        path: 'exits',
        title: 'Salidas | Pelifolk',
        providers: [ExitRepository],
        loadComponent: () => import('../exits/presentation/exit-list').then((m) => m.ExitList),
      },
      {
        path: 'finance',
        title: 'Economía | Pelifolk',
        providers: [FinanceRepository],
        loadComponent: () =>
          import('../finance/presentation/finance-list').then((m) => m.FinanceList),
      },
      { path: 'ranches', pathMatch: 'full', redirectTo: 'locations' },
      {
        path: 'users',
        title: 'Usuarios | Pelifolk',
        providers: ACCESS_PROVIDERS,
        loadComponent: () =>
          import('../users/presentation/pages/user-list/user-list').then((m) => m.UserList),
      },
      {
        path: 'roles',
        title: 'Roles y permisos | Pelifolk',
        providers: ACCESS_PROVIDERS,
        loadComponent: () =>
          import('../users/presentation/pages/role-list/role-list').then((m) => m.RoleList),
      },
      {
        path: 'overview',
        title: 'Resumen | Pelifolk',
        loadComponent: () =>
          import('./presentation/pages/overview/overview').then((m) => m.Overview),
      },
      ...dashboardNavigation
        .filter(
          (item) =>
            ![
              'overview',
              'users',
              'roles',
              'animals',
              'breeds',
              'locations',
              'groups',
              'management',
              'breeding',
              'exits',
              'finance',
              'health',
            ].includes(item.path),
        )
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
