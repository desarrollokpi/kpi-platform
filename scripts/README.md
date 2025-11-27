# Scripts de KPI Platform v2

Este directorio contiene scripts útiles para desarrollo y gestión de la plataforma.

## Scripts de Docker

### 🚀 docker-up.sh
Inicia servicios del entorno de desarrollo.

**Uso:**
```bash
./scripts/docker-up.sh [service] [options]
```

**Servicios disponibles:**
- `mysql` - Base de datos MySQL
- `redis` - Cache Redis
- `server` - API Backend
- `client` - Frontend React
- `db-init` - Inicialización de base de datos

**Opciones:**
- `-b, --build` - Reconstruir imágenes antes de iniciar
- `-d, --detached` - Ejecutar en segundo plano
- `-h, --help` - Mostrar ayuda

**Ejemplos:**
```bash
./scripts/docker-up.sh              # Iniciar todos los servicios
./scripts/docker-up.sh -d           # Iniciar todos en background
./scripts/docker-up.sh mysql -d     # Solo MySQL en background
./scripts/docker-up.sh server -b    # Reconstruir e iniciar server
```

---

### 🛑 docker-down.sh
Detiene servicios del entorno de desarrollo.

**Uso:**
```bash
./scripts/docker-down.sh [service] [options]
```

**Servicios disponibles:**
- `mysql`, `redis`, `server`, `client`, `db-init` (igual que docker-up.sh)

**Opciones:**
- `-v, --volumes` - Eliminar volúmenes (⚠️ BORRA TODOS LOS DATOS)
- `-h, --help` - Mostrar ayuda

**Ejemplos:**
```bash
./scripts/docker-down.sh              # Detener todos los servicios
./scripts/docker-down.sh server       # Detener solo el server
./scripts/docker-down.sh -v           # Detener todo y eliminar datos
./scripts/docker-down.sh mysql -v     # Detener MySQL y eliminar su volumen
```

---

### 📋 docker-logs.sh
Visualiza logs de los servicios.

**Uso:**
```bash
./scripts/docker-logs.sh [service] [options]
```

**Servicios disponibles:**
- `mysql`, `redis`, `server`, `client`, `db-init`

**Opciones:**
- `-f, --follow` - Seguir logs en tiempo real (live tail)
- `-t, --tail N` - Número de líneas a mostrar (default: 100)
- `-h, --help` - Mostrar ayuda

**Ejemplos:**
```bash
./scripts/docker-logs.sh                  # Todos los logs (últimas 100 líneas)
./scripts/docker-logs.sh server           # Solo logs del server
./scripts/docker-logs.sh server -f        # Seguir logs del server en vivo
./scripts/docker-logs.sh -f               # Seguir todos los logs
./scripts/docker-logs.sh server -t 500    # Últimas 500 líneas del server
./scripts/docker-logs.sh mysql -f -t 50   # Seguir MySQL, mostrar últimas 50
```

---

## Scripts de Base de Datos

### 🌱 seed-base-data.js
Crea datos base requeridos para iniciar la plataforma:
- Roles por defecto (root_admin, tenant_admin, user)
- Instancia primaria de Superset
- Usuario Root Admin global

**Uso:**
```bash
# Desde el directorio server/
pnpm run seed:base

# O con archivo .env específico:
SEED_ENV=./config/.env.dev pnpm run seed:base
```

**Variables de entorno:**
- `SEED_ROOT_USERNAME` - Username del root admin (default: "root.admin")
- `SEED_ROOT_EMAIL` - Email del root admin (default: "root.admin@kpimanagers.com")
- `SEED_ROOT_PASSWORD` - Password del root admin (default: "RootAdmin#2025")
- `SEED_SUPERSET_URL` - URL de Superset (default: "https://superset.local")
- `SEED_SUPERSET_API_USER` - Usuario API de Superset (default: "service_bot")
- `SEED_SUPERSET_API_PASSWORD` - Password API de Superset (default: "superset-secret")

---

### 🎭 seed-demo-data.js
Crea datos de demostración para testing:
- 2 tenants de prueba (Acme Analytics, Globex Retail)
- 2 instancias de Superset
- 3 reportes de ejemplo
- Implementa patrón Techo/Piso completo
- Usuarios admin y regulares por tenant

**Uso:**
```bash
# Desde el directorio server/
pnpm run seed:demo

# Forzar recreación:
SEED_FORCE=1 pnpm run seed:demo
```

**Variables de entorno:**
- `SEED_TENANT_ADMIN_PASSWORD` - Password para admins (default: "TenantAdmin#2025")
- `SEED_USER_PASSWORD` - Password para usuarios (default: "UserAccess#2025")
- `SEED_FORCE` - Forzar recreación si ya existe (default: "0")

**Credenciales generadas:**

*Tenant Admins:*
- `acme.admin` / TenantAdmin#2025
- `globex.admin` / TenantAdmin#2025

*Usuarios regulares:*
- `acme.user` / UserAccess#2025
- `globex.user` / UserAccess#2025

---

### 🧹 cleanup-demo-data.js
Elimina todos los datos de demostración creados por seed:demo.

**Uso:**
```bash
# Desde el directorio server/
pnpm run cleanup:demo
```

**Acciones:**
- Elimina tenants demo (Acme Analytics, Globex Retail)
- Elimina usuarios asociados y sus asignaciones
- Elimina reportes demo
- Elimina instancias de Superset demo
- Resetea contadores auto-increment
- Preserva datos base (roles, root admin)

---

### 🛠️ seed-utils.js
Utilidades compartidas para scripts de seed. No se ejecuta directamente.

**Funciones principales:**
- `ensureRole(name)` - Crea o verifica rol
- `ensureAccount(data)` - Crea o actualiza tenant
- `ensureUser(data)` - Crea o actualiza usuario
- `ensureReport(data)` - Crea o actualiza reporte
- `ensureSupersetInstance(data)` - Crea o verifica instancia Superset
- `enableAccountCeiling(accountId, reportId)` - Habilita reporte en techo
- `enableAccountFloor(accountId, reportId)` - Habilita reporte en piso (valida techo)
- `assignReportToUser(userId, reportId)` - Asigna reporte a usuario (valida piso)

---

## Flujo de Trabajo Típico

### Inicio de desarrollo:
```bash
# 1. Iniciar servicios
./scripts/docker-up.sh -d

# 2. Ver logs si hay problemas
./scripts/docker-logs.sh -f

# 3. Inicializar base de datos (si es primera vez)
cd server && pnpm run seed:base

# 4. (Opcional) Agregar datos demo
pnpm run seed:demo
```

### Durante desarrollo:
```bash
# Ver logs del server en tiempo real
./scripts/docker-logs.sh server -f

# Reiniciar solo el server
./scripts/docker-down.sh server
./scripts/docker-up.sh server -d

# Reconstruir server después de cambios en dependencies
./scripts/docker-up.sh server -b -d
```

### Limpieza:
```bash
# Detener servicios (preservar datos)
./scripts/docker-down.sh

# Limpiar datos demo
cd server && pnpm run cleanup:demo

# Reset completo (BORRA TODO)
./scripts/docker-down.sh -v
```

---

## Arquitectura de Base de Datos

### Patrón Techo/Piso (Ceiling/Floor)

La plataforma implementa un sistema de permisos de tres niveles:

1. **Techo (Ceiling)**: Root Admin define máximo de reportes disponibles por tenant
   - Tabla: `accounts_reports_ceiling`

2. **Piso (Floor)**: Tenant Admin activa subset de reportes del techo
   - Tabla: `accounts_reports_floor`
   - Valida que exista en ceiling

3. **Asignaciones de Usuario**: Tenant Admin asigna reportes del piso a usuarios
   - Tabla: `users_reports`
   - Valida que exista en floor

### Vista de Validación

`v_user_reports_access` - Valida cadena completa de permisos:
```sql
SELECT * FROM v_user_reports_access WHERE access_status = 'VALID';
```

**Estados posibles:**
- `VALID` - Usuario tiene acceso completo (ceiling → floor → user)
- `NO_CEILING` - Reporte no está en ceiling del tenant
- `NO_FLOOR` - Reporte no activado en floor
- `NO_USER_ASSIGNMENT` - Usuario no tiene asignación

---

## Notas Importantes

- Todos los scripts de seed son idempotentes (se pueden ejecutar múltiples veces)
- Los scripts usan `dotenv` para cargar variables de entorno desde `config/.env.dev`
- Las contraseñas por defecto son para desarrollo, **CAMBIAR EN PRODUCCIÓN**
- Los scripts de Docker requieren que Docker Desktop esté corriendo
- El patrón Techo/Piso valida en cascada: eliminar ceiling elimina floor, eliminar floor elimina user assignments
