import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

const MESSAGES: Record<string, string> = {
  'Finance category not found': 'La categoría ya no está disponible.',
  'Finance category already exists': 'Ya existe una categoría con ese nombre.',
  'Finance category has records':
    'La categoría tiene movimientos asociados y no se puede eliminar.',
  'Supplier not found': 'El proveedor ya no está disponible.',
  'Supplier already exists': 'Ya existe un proveedor con ese nombre.',
  'Supplier is inactive': 'Activa el proveedor antes de asignarlo a un nuevo gasto.',
  'Finance record not found': 'El movimiento ya no está disponible.',
  'Income requires a sale exit': 'Selecciona una salida por venta válida.',
  'Income date is before sale date': 'El ingreso no puede ser anterior a la venta.',
  'Sale already has an income': 'Esa venta ya tiene un ingreso registrado.',
  'Invalid finance date range': 'La fecha inicial no puede ser posterior a la final.',

  'Animal already has an exit': 'El animal ya tiene una salida registrada.',
  'Exit date is before birth date': 'La salida no puede ser anterior al nacimiento.',
  'Exit date conflicts with animal history':
    'Hay registros posteriores a esa fecha. Revisa el historial y la fecha de salida.',
  'Activity date is after animal exit': 'La fecha no puede ser posterior a la salida del animal.',
  'Reproductive animal sex is incompatible':
    'La madre o hembra debe ser hembra y el padre o macho debe ser macho.',
  'Reproductive event must be after animal birth':
    'La fecha debe ser posterior al nacimiento de los padres.',
  'Mating does not belong to this female': 'La monta seleccionada no pertenece a esta hembra.',
  'Pregnancy diagnosis is before mating':
    'El diagnóstico no puede ser anterior a la monta relacionada.',
  'Birth type not found': 'El tipo de parto no está disponible.',
  'Female already has a birth on this date': 'La hembra ya tiene un parto registrado en esa fecha.',
  'Birth-linked parentage and birth date cannot be changed':
    'La fecha de nacimiento y los padres están vinculados a un parto registrado.',
  'Sex conflicts with reproductive history':
    'El sexo no se puede cambiar porque el animal tiene historial reproductivo.',
  'Birth date conflicts with reproductive history':
    'El nacimiento debe ser anterior a los eventos reproductivos registrados.',
  'Health program not found': 'El programa sanitario ya no está disponible.',
  'Health program name already exists': 'Ya existe un programa con ese nombre.',
  'Cannot change product of a program with applications':
    'El programa ya tiene aplicaciones. Conserva su producto o crea otro programa.',
  'Health program is inactive': 'Activa el programa antes de registrar aplicaciones.',
  'Animal sex does not match health program':
    'El animal no coincide con el sexo configurado en el programa.',
  'Animal has not reached program minimum age':
    'Revisa el nacimiento: el animal debe cumplir la edad mínima en la fecha de aplicación.',
  'Animal has left the herd': 'El animal tiene una salida registrada y ya no pertenece al hato.',
  'Application date must be after last program application':
    'La fecha debe ser posterior a la última aplicación de este programa.',
  'Product not found': 'El producto ya no está disponible.',
  'Product name already exists': 'Ya existe un producto con ese nombre.',
  'Product catalog entry not found': 'Selecciona un tipo y una unidad disponibles.',
  'Product is inactive': 'El producto está inactivo. Actívalo para registrar tratamientos.',
  'Treatment catalog entry not found': 'Selecciona una unidad y una vía disponibles.',
  'Reopen the case before adding a treatment': 'Reabre el caso antes de registrar un tratamiento.',
  'Treatment date is before case start date':
    'El tratamiento no puede comenzar antes del inicio del caso.',
  'Closed date is before treatment ends':
    'El cierre no puede ser anterior al último día del tratamiento.',
  'Reopen the case before adding a diagnosis':
    'El caso está cerrado. Reábrelo antes de agregar un diagnóstico.',
  'Diagnosis date is before case start date':
    'El diagnóstico no puede ser anterior al inicio del caso.',
  'Closed date is before a diagnosis':
    'El cierre no puede ser anterior a un diagnóstico registrado.',
  'Health date is before birth date':
    'La fecha del registro sanitario no puede ser anterior al nacimiento.',
  'Health case not found': 'El caso sanitario ya no está disponible.',
  'Health case changed; reload before updating':
    'El caso cambió. Cierra y vuelve a abrirlo antes de actualizar su estado.',
  'Health case already has this status': 'El caso ya tiene ese estado.',
  'Closed date is before case start date': 'El cierre no puede ser anterior al inicio del caso.',
  'Birth date conflicts with health history':
    'El nacimiento no puede ser posterior a un registro sanitario.',
  'Weight date is before birth date': 'La fecha del pesaje no puede ser anterior al nacimiento.',
  'Animal already has a weight on this date': 'Este animal ya tiene un pesaje en esa fecha.',
  'Birth date conflicts with weight history':
    'El nacimiento no puede ser posterior a un pesaje registrado.',
  'Location not found': 'La ubicación ya no está disponible.',
  'Location type not found': 'El tipo de ubicación seleccionado no está disponible.',
  'Location type already exists': 'Ese tipo de ubicación ya existe.',
  'Location name already exists': 'Ya existe una ubicación con ese nombre.',
  'Group not found': 'El lote ya no está disponible.',
  'Group name already exists': 'Ya existe un lote con ese nombre.',
  'Group has assigned animals': 'Mueve o retira los animales antes de desactivar el lote.',
  'Group is inactive': 'El lote está inactivo. Actívalo antes de asignar animales.',
  'Movement date must be after current admission':
    'La fecha del cambio debe ser posterior al ingreso actual. Solo puede registrarse un ingreso por día.',
  'Birth date conflicts with group history':
    'El nacimiento no puede ser posterior a un ingreso del animal en un lote.',
  'Movement date cannot precede birth':
    'La fecha del movimiento no puede ser anterior al nacimiento del animal.',
  'Movement overlaps existing history':
    'La fecha del movimiento se cruza con un periodo ya registrado.',
  'Animal already belongs to this group': 'Uno de los animales ya pertenece a este lote.',
  'Animal already belongs to another group':
    'Hay animales en otros lotes. Activa la opción de moverlos para continuar.',
  'Animal is no longer assigned to this group':
    'El animal ya no pertenece a este lote. Actualiza el listado.',

  'Animal not found': 'El animal ya no está disponible.',
  'Breed not found': 'La raza seleccionada no está disponible.',
  'Breed is assigned to animals':
    'La raza está asignada a animales. Cambia sus razas antes de eliminarla.',
  'Breed already exists': 'Esa raza ya existe en el catálogo.',
  'SINIIGA already exists': 'Ya existe un animal con ese SINIIGA.',
  'Parent not found': 'El padre o la madre seleccionados no están disponibles.',
  'Parent sex is incompatible': 'La madre debe ser hembra y el padre debe ser macho.',
  'Parent must be born before offspring': 'Los padres deben haber nacido antes que sus crías.',
  'Genealogy cannot contain cycles':
    'El parentesco genera un ciclo: el animal no puede ser su propio antepasado.',
  'Sex conflicts with existing offspring':
    'El sexo no se puede cambiar porque este animal ya figura como padre o madre.',

  'Owner role cannot be modified':
    'El rol del dueño está protegido para conservar el acceso administrativo.',
  'Initial system role names cannot be changed':
    'Los nombres de los roles iniciales no se pueden cambiar.',
  'Initial system roles cannot be deleted': 'Los roles iniciales no se pueden eliminar.',
  'Initial system roles cannot be modified or deleted': 'Este rol inicial está protegido.',
  'Role is assigned to users':
    'El rol tiene usuarios asignados. Cambia sus roles antes de eliminarlo.',
  'You cannot modify your own assigned role': 'No puedes modificar el rol que tienes asignado.',
  'Cannot grant or manage permissions you do not have':
    'Solo puedes administrar permisos que ya tienes.',
  'Cannot assign permissions you do not have':
    'El rol seleccionado tiene permisos superiores a los tuyos.',
  'Cannot modify a user with higher permissions':
    'Esta cuenta tiene permisos superiores a los tuyos.',
  'You cannot change your own role or deactivate your own account':
    'No puedes cambiar tu propio rol ni desactivar tu cuenta.',
  'You cannot deactivate your own account': 'No puedes desactivar tu propia cuenta.',
  'Duplicate value or invalid relationship':
    'Ya existe un registro con esos datos o la relación seleccionada no es válida.',
  'User not found': 'El usuario ya no está disponible.',
  'Role not found': 'El rol ya no está disponible.',
};

export function apiError(error: unknown, fallback: string): string {
  if (error instanceof TimeoutError || (error instanceof HttpErrorResponse && error.status === 0)) {
    return 'No se pudo conectar con el servidor. Intenta nuevamente.';
  }
  if (error instanceof HttpErrorResponse) {
    const detail: unknown = error.error?.detail;
    if (typeof detail === 'string' && MESSAGES[detail]) return MESSAGES[detail];
    if (error.status === 401) return 'Tu sesión terminó. Inicia sesión nuevamente.';
    if (error.status === 403) return 'No tienes permiso para realizar esta acción.';
    if (error.status === 422) return 'Revisa los datos del formulario.';
    if (error.status === 503) return 'El servicio no está disponible. Intenta nuevamente.';
    return fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
