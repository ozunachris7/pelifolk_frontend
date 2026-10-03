# Arquitectura de Pelifolk

## Decisión

Frontend Angular organizado por funcionalidades (Feature-Based Architecture), con principios de Clean Architecture dentro de cada funcionalidad. No existe una carpeta `layout`: la composición general corresponde a `App` y los componentes visuales reutilizables a `shared/ui`.

Esta organización agrupa áreas del negocio; no es una implementación estricta de Vertical Slice por cada acción. Los casos de uso representan las acciones dentro de cada área.

La fuente de requisitos es `PROYECTO APP PELIFOLK ING NIVON.docx`. Describe descubrimiento de necesidades; las decisiones de implementación aquí son propuestas técnicas, no requisitos adicionales del documento.

## Estructura

```text
src/app/
├── core/
│   ├── auth/
│   └── http/
├── shared/
│   └── ui/
├── features/
│   ├── ranchos/
│   ├── usuarios/
│   ├── animales/
│   ├── sanidad/
│   ├── reproduccion/
│   ├── manejo/
│   ├── economia/
│   └── reportes/
├── app.ts
├── app.config.ts
└── app.routes.ts
```

Cada funcionalidad cuenta con:

```text
sanidad/
├── domain/          # Entidades, reglas y contratos de repositorios
├── application/     # Casos de uso que coordinan reglas y repositorios
├── infrastructure/  # Adaptadores HTTP, DTO y conversión de datos
└── presentation/    # Páginas, componentes y estado de la interfaz
```

Las rutas de una funcionalidad se incorporarán como `<funcionalidad>.routes.ts` cuando existan páginas reales. Las rutas secundarias se cargarán bajo demanda. No se crean pantallas ni servicios vacíos para representar funciones todavía no implementadas.

## Responsabilidades de negocio

| Funcionalidad | Responsabilidad | Ejemplos de casos de uso |
| --- | --- | --- |
| ranchos | Rancho, corrales y ubicaciones | Registrar corral, consultar rancho |
| usuarios | Personas y asignación de roles por rancho | Asignar rol, consultar miembros |
| animales | Identidad, nacimiento, estado y consulta del historial integral | Registrar animal, consultar ficha e historial |
| sanidad | Observaciones, diagnósticos, tratamientos y seguimiento | Reportar hallazgo, registrar diagnóstico, registrar aplicación |
| reproduccion | Cruzas, gestaciones, partos, parentesco y desempeño reproductivo | Registrar cruza, registrar parto, consultar genealogía |
| manejo | Pesajes, alimentación, movimientos e incidentes de manejo | Registrar peso, trasladar animal, registrar incidente |
| economia | Gastos, ingresos, compras y ventas | Registrar gasto, registrar venta |
| reportes | Lecturas agregadas del hato y sus resultados | Consultar pendientes, consultar indicadores económicos |

`animales` conserva la identidad del animal; `reproduccion` gestiona los vínculos genealógicos. El historial integral reúne registros de las distintas áreas sin duplicar su propiedad. Las ventas pertenecen a `economia`, pero deben coordinar el cambio de estado del animal en el backend dentro de una transacción.

## Reglas de dependencia

- `domain` usa TypeScript independiente de Angular, HTTP, almacenamiento y componentes.
- `application` depende de `domain`; recibe repositorios mediante sus contratos. Los casos de uso permanecen independientes de Angular.
- `infrastructure` implementa esos contratos; puede usar `HttpClient` y la inyección de dependencias de Angular. Convierte DTO de la API a modelos del dominio.
- `presentation` invoca casos de uso; utiliza signals para estado visual y RxJS donde sea necesario para flujos asíncronos. No consulta directamente `HttpClient` ni implementa reglas de negocio.
- Los proveedores de Angular conectan contratos y adaptadores en la configuración o rutas de la funcionalidad. Es el punto de composición de dependencias.
- Una funcionalidad no importa adaptadores, componentes o estado internos de otra. Las consultas integradas y operaciones entre áreas se resuelven mediante contratos explícitos de API.
- `core` contiene infraestructura transversal: sesión, conexión HTTP e interceptores. Las reglas y entidades de negocio permanecen en su funcionalidad.
- `shared/ui` contiene componentes visuales genéricos, sin reglas de negocio ni acceso a API. Solo se mueve código allí cuando existe reutilización real.

Flujo de ejecución:

```text
Página → caso de uso → contrato de repositorio → adaptador HTTP → API
```

El contrato es propiedad del dominio; su implementación está en infraestructura. La dirección de ejecución no cambia la dirección de dependencia del código.

## Backend propuesto

El repositorio actual contiene solo el frontend. Se propone un backend como monolito modular, con las mismas áreas de negocio y una base de datos relacional. Su lenguaje y framework quedan pendientes de elección.

El backend es responsable de permisos, validaciones definitivas, transacciones, persistencia e historial de auditoría. Los guards y botones de Angular facilitan la navegación, pero no sustituyen la autorización del servidor. Cada operación verifica el acceso del usuario al rancho correspondiente.

## Historial y trazabilidad

- Los registros históricos deben conservar autor, rancho, animal cuando aplique, fecha del hecho y fecha del registro.
- Una observación, un diagnóstico y una aplicación de tratamiento son hechos distintos; no se sobrescriben entre sí.
- Se propone corregir mediante rectificaciones vinculadas al registro original, conservando motivo y autor. Debe validarse esta política: el documento prohíbe borrar o corregir historia, pero también permite al dueño modificar todo.
- Conservar registros históricos no obliga a implementar Event Sourcing. Un modelo relacional con historial y auditoría puede cubrir la necesidad inicial.
- Los costos directos de un animal se distinguen de gastos generales del rancho; cualquier reparto de gastos debe tener una regla explícita.
- La validación genealógica debe impedir parentescos imposibles y ciclos. Las alertas reproductivas y criterios de selección requieren reglas acordadas con los responsables del rancho.

## Conectividad

La primera versión puede operar con conexión. El registro sin internet es una decisión pendiente: el documento contempla esperar hasta volver a la oficina. Si se incorpora sincronización, se deben definir almacenamiento local, identificadores, prevención de duplicados y resolución de conflictos antes de implementar ese flujo.

## Convenciones de desarrollo

- Generar componentes con Angular CLI: `ng g c ruta --skip-tests`.
- Ejemplo: `ng g c features/animales/presentation/pages/listado-animales --skip-tests`.
- `angular.json` configura `skipTests: true` para componentes nuevos. Los tests existentes no se eliminan.
- Crear archivos y subcarpetas adicionales cuando una funcionalidad los necesite; evitar capas de delegación sin propósito.
- Verificar la compilación después de cambios estructurales. Incorporar pruebas específicas cuando se implementen reglas relevantes como permisos, genealogía o rectificaciones.

## Orden inicial de implementación

1. Sesión, usuarios, roles y contexto de rancho.
2. Registro e identificación de animales e historial básico.
3. Hallazgos sanitarios, diagnósticos, tratamientos y pendientes.
4. Manejo, reproducción y genealogía.
5. Economía e indicadores.

Referencias: [organización por funcionalidades](https://angular.dev/style-guide) y [carga de rutas](https://angular.dev/guide/routing/loading-strategies).
