# Noil Web Template

Plantilla base para los sistemas web de Noil. Trae el diseño, los componentes, la autenticación y las reglas de trabajo listas para arrancar un proyecto nuevo sin copiar cosas de otros repos.

Stack: Laravel 13 · Inertia v3 · React 19 · TypeScript · Tailwind v4 · shadcn/Radix · lucide · Fortify · Wayfinder.

## Arranque

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
composer run dev
```

Entra en `http://localhost:8000` con `admin@noil.mx` / `password`.

## Qué incluye

- **Tema Noil** en `resources/css/app.css`: paleta, tipografía (Plus Jakarta Sans), sidebar oscuro, badges de estatus, sombras. Solo modo claro.
- **Componentes** en `resources/js/components/`:
    - `ui/` primitivos shadcn sobre Radix (50).
    - `noil/` sistema de diseño: `PageShell`, `ContextPanel`, `DataTable` (búsqueda, exportar, columnas, paginación), `EmptyState`, `confirmDialog`, `FlashToaster`, `Sparkline`/`Donut`, helpers de formulario.
    - `layout/` sidebar con búsqueda de menú, breadcrumbs, menú de usuario.
    - `auth/`, `dashboard/`, `ejemplo/` componentes por módulo.
- **Hooks** en `resources/js/hooks/`: toda la lógica de estado y llamadas a Inertia vive aquí, los componentes solo pintan.
- **Auth con Fortify**: login, recuperar y restablecer contraseña, confirmar contraseña, perfil y cambio de contraseña. Sin registro ni 2FA (se activan en `config/fortify.php`).
- **Servicios de backend** en `app/Services/`: `MaximoId` (siguiente ID por tabla/contrato), `AutoFolio` (folios desde `master_cnf_folios`), `DynamicQueryExecutor` (consultas nombradas de `master_consultassql`) y `Kardex` (bitácora). Con tests.
- **Páginas demo**: `/dashboard` (hero, KPIs, gráficas) y `/ejemplo` (listado con `ContextPanel` + `DataTable` + drawer de captura). Son la referencia para copiar; el controlador de ejemplo guarda en sesión y se reemplaza por un módulo real.
- **Validación en español** (`lang/es`, `APP_LOCALE=es`).

## Reglas de trabajo (skills)

Las reglas para agentes de IA y personas viven en `.agents/skills/` y se cargan solas en Claude Code (symlinks en `.claude/skills/`) y Codex (`AGENTS.md`):

| Skill          | Cuándo                                                                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui-noil`      | Antes de tocar `resources/js`: qué componente usar, tema, drawers, tablas, hooks, límite de 200 líneas por archivo.                                                                |
| `backend-noil` | Antes de tocar `app/`, `routes/`, `database/`: servicios, dominio por carpeta, consultas nombradas, convención de columnas (`IdCliente`, `SNombre`, `EEstatus`), validación, auth. |
| `flujo-noil`   | Para arrancar un módulo nuevo (pasos, dónde va cada archivo) y el cierre obligatorio de toda tarea.                                                                                |

Léelas antes de escribir código. Las guías genéricas de Laravel Boost se regeneran con `php artisan boost:update` y no se editan.

## Comandos

| Qué                              | Comando                                      |
| -------------------------------- | -------------------------------------------- |
| Servidor + Vite + colas + logs   | `composer run dev`                           |
| Tests                            | `php artisan test --compact`                 |
| Formato PHP                      | `vendor/bin/pint --dirty`                    |
| Lint y formato JS                | `npx vp check --fix`                         |
| Tipos                            | `npx tsc --noEmit`                           |
| Rutas tipadas tras cambiar rutas | `php artisan wayfinder:generate --with-form` |
| Build de producción              | `npm run build`                              |
| Agregar un primitivo shadcn      | `npx shadcn@latest add <nombre>`             |

## Estructura

```
app/
  Domain/<Modulo>/       modelo, interfaz, repositorios (DynamicQuery / Eloquent), casos de uso
  Http/Controllers/      controladores delgados
  Http/Requests/         Form Requests con atributos en español
  Services/              MaximoId, AutoFolio, DynamicQueryExecutor, Kardex
resources/js/
  components/            ui/ noil/ layout/ auth/ <modulo>/
  hooks/                 use-<modulo>-<cosa>.ts
  layouts/               app (sidebar), auth, settings
  lib/                   fechas, utils, constantes
  pages/                 una carpeta por módulo
  types/                 tipos compartidos
.agents/skills/          reglas de trabajo
```

## Fechas y formato

Las fechas se capturan y muestran como `dd-mm-aaaa` (`DateInputPicker`, `formatDate`) y viajan al backend como `aaaa-mm-dd`. Montos con `Intl.NumberFormat('es-MX')`.
