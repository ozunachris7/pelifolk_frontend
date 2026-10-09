import {
  ChartNoAxesCombined,
  HeartPulse,
  Layers,
  House,
  LayoutDashboard,
  ListChecks,
  Network,
  PawPrint,
  Users,
  ShieldCheck,
  Wallet,
  LogOut,
} from 'lucide-angular';

export const dashboardNavigation: {
  path: string;
  label: string;
  icon: typeof Users;
  description: string;
  permission?: string;
}[] = [
  {
    path: 'overview',
    label: 'Resumen',
    icon: LayoutDashboard,
    description: 'Consulta la actividad y los pendientes de tu rancho.',
  },
  {
    path: 'animals',
    label: 'Animales',
    icon: PawPrint,
    description: 'Identificación e historial de cada animal del hato.',
    permission: 'animals:read',
  },
  {
    path: 'breeds',
    label: 'Razas',
    icon: PawPrint,
    description: 'Catálogo de razas del hato.',
    permission: 'animals:read',
  },
  {
    path: 'health',
    label: 'Sanidad',
    icon: HeartPulse,
    description: 'Hallazgos, diagnósticos, tratamientos y seguimiento.',
    permission: 'health:read',
  },
  {
    path: 'breeding',
    label: 'Reproducción',
    icon: Network,
    description: 'Cruzas, gestaciones, partos y genealogía.',
    permission: 'breeding:read',
  },
  {
    path: 'management',
    label: 'Manejo',
    icon: ListChecks,
    description: 'Pesajes, alimentación y movimientos del hato.',
    permission: 'weights:read',
  },
  {
    path: 'exits',
    label: 'Salidas',
    icon: LogOut,
    description: 'Ventas, bajas e historial de salidas del hato.',
    permission: 'exits:read',
  },
  {
    path: 'finance',
    label: 'Economía',
    permission: 'finance:read',
    icon: Wallet,
    description: 'Gastos, ingresos y ventas del rancho.',
  },
  {
    path: 'reports',
    label: 'Reportes',
    icon: ChartNoAxesCombined,
    description: 'Indicadores productivos y económicos.',
  },
  {
    path: 'locations',
    label: 'Ubicaciones',
    icon: House,
    description: 'Corrales, potreros y áreas del hato.',
    permission: 'locations:read',
  },
  {
    path: 'groups',
    label: 'Lotes',
    icon: Layers,
    description: 'Agrupación de animales e historial de movimientos.',
    permission: 'groups:read',
  },
  {
    path: 'users',
    label: 'Usuarios',
    icon: Users,
    description: 'Personas, roles y permisos del rancho.',
    permission: 'users:read',
  },
  {
    path: 'roles',
    label: 'Roles y permisos',
    icon: ShieldCheck,
    description: 'Accesos y responsabilidades de cada rol.',
    permission: 'roles:read',
  },
];

export function navigationFor(permissions: readonly string[]) {
  return dashboardNavigation.filter(
    (item) => !item.permission || permissions.includes(item.permission),
  );
}
