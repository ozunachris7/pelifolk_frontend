const ROLE_LABELS: Record<string, string> = {
  owner: 'Dueño',
  administrator: 'Administrador',
  manager: 'Encargado',
  worker: 'Trabajador',
  veterinarian: 'Veterinario',
  livestock_technician: 'Técnico pecuario',
};
const PERMISSION_LABELS: Record<string, string> = {
  'audit:read': 'Consultar auditoría y cambios de todos los módulos',
  'feeding:read': 'Consultar alimentación, precios e historial',
  'feeding:write': 'Registrar alimentos, precios y consumos',
  'finance:read': 'Consultar economía, proveedores y categorías',
  'finance:write': 'Registrar y editar movimientos y catálogos económicos',
  'exits:read': 'Consultar salidas e historial',
  'exits:write': 'Registrar salidas del hato',
  'breeding:read': 'Consultar reproducción e historial',
  'breeding:write': 'Registrar montas, gestaciones y partos',
  'health:read': 'Consultar observaciones y casos sanitarios',
  'health:write': 'Registrar observaciones y administrar casos sanitarios',
  'weights:read': 'Consultar pesajes, destetes e historial',
  'weights:write': 'Registrar pesajes y destetes',
  'locations:read': 'Consultar ubicaciones',
  'locations:write': 'Crear y editar ubicaciones',
  'groups:read': 'Consultar lotes e historial',
  'groups:write': 'Administrar lotes y mover animales',
  'animals:read': 'Consultar animales y razas',
  'animals:write': 'Registrar y editar animales y razas',
  'users:read': 'Consultar usuarios',
  'users:write': 'Crear y editar usuarios',
  'roles:read': 'Consultar roles y permisos',
  'roles:write': 'Administrar roles y permisos',
};
export const roleLabel = (name: string): string => ROLE_LABELS[name] ?? name.replaceAll('_', ' ');
export const permissionLabel = (permission: string): string =>
  PERMISSION_LABELS[permission] ?? permission;
