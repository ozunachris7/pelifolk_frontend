import {
  ChartNoAxesCombined,
  HeartPulse,
  House,
  LayoutDashboard,
  ListChecks,
  Network,
  PawPrint,
  Users,
  Wallet,
} from 'lucide-angular';

export const dashboardNavigation = [
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
  },
  {
    path: 'health',
    label: 'Sanidad',
    icon: HeartPulse,
    description: 'Hallazgos, diagnósticos, tratamientos y seguimiento.',
  },
  {
    path: 'breeding',
    label: 'Reproducción',
    icon: Network,
    description: 'Cruzas, gestaciones, partos y genealogía.',
  },
  {
    path: 'management',
    label: 'Manejo',
    icon: ListChecks,
    description: 'Pesajes, alimentación y movimientos del hato.',
  },
  {
    path: 'finance',
    label: 'Economía',
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
    path: 'ranches',
    label: 'Ranchos',
    icon: House,
    description: 'Ranchos, corrales y ubicaciones.',
  },
  {
    path: 'users',
    label: 'Usuarios',
    icon: Users,
    description: 'Personas, roles y permisos del rancho.',
  },
] as const;
