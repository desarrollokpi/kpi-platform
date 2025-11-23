# Cambios relevantes y actualizaciones del repositorio

## Ajustes funcionales observados
- Separación modular en `server/src/<módulo>`: cada dominio (admins, users, reports, etc.) incluye controlador, servicio, repositorio y rutas dedicadas para aislar responsabilidades.
- Control de sesión reforzado: Redis (ver `server/src/common/redis.repository.js`) almacena sesiones temporizadas, lo que permite expirar y refrescar JWT en cada request autenticado.
- Soporte multi-tenant: el cliente detecta el subdominio (`client/src/hooks/useSubdomain.js`) para cargar logos y términos particulares, mientras que el backend sirve `/api/admins/logoBySubdomain`.
- Embebido Power BI: `server/src/common/powerbi.repository.js` centraliza la comunicación con Microsoft y `client/src/components/reports/Report.js` renderiza dashboards mediante `powerbi-client-react`.
- Dockerización para desarrollo local: `docker-compose.yml` levanta cliente, servidor y Redis con volúmenes montados y configuración `.env` compartida.

## Actualizaciones de dependencias y tecnologías

### Backend (`server/package.json`)
- `express@^4.17.1`: framework base para el API REST.
- `mysql2@^2.3.3`: driver moderno con soporte de múltiples statements.
- `redis@^4.0.1`: cliente compatible con Redis >= 6 para gestión de sesiones.
- `jsonwebtoken@^8.5.1`: emisión y verificación de JWT persistidos en cookies.
- `axios@^0.24.0`: llamadas a la API de Power BI y otros servicios externos.
- `dayjs@^1.10.7`: utilidades livianas de fecha para servicios y logs.
- `multer@^1.4.4` y `formidable@^1.2.2`: manejo de uploads (logos, recursos).
- `nodemon@^2.0.2` y `concurrently@^5.1.0`: hot reload y ejecución paralela en desarrollo.
- `pnpm` (packageManager 10.22.0): gestor elegido para scripts de scaffolding (`new-model`, `connect-redux`, etc.).

### Frontend (`client/package.json`)
- `react@^17.0.2` y `react-dom@^17.0.2`: núcleo de la SPA y compatibilidad con React Router 6.
- `react-router-dom@^6.2.1`: enrutado declarativo con soporte para rutas privadas por rol.
- `redux@^4.1.2`, `react-redux@^7.2.6`, `redux-thunk@^2.4.1`: estado global y side-effects asíncronos.
- `@mui/material@^5.2.x`, `@mui/lab@^5.0.0-alpha.66`, `@mui/icons-material@^5.2.5`: sistema de diseño con overrides centralizados (`src/theme.js`).
- `powerbi-client@^2.19.1` y `powerbi-client-react@^1.3.3`: embebido de dashboards interactivos.
- `axios@^0.24.0`: consumo del backend para auth, reportes y catálogos.
- `@craco/craco@^7.0.0` y `env-cmd@^10.1.0`: configuración extendida de CRA con perfiles `dev` y `qa`.
- `react-toastify@^9.1.1`: notificaciones de UI.
- `sass@^1.94.2`: estilos modulares (`App.scss` y parciales).

## Impacto de los cambios
- Compatibilidad garantizada al combinar CRA 5 + React 17 + MUI 5 con tooling moderno (Webpack/Babel gestionados por CRACO).
- Monitorización y depuración mejoradas con morgan, logger propio y callbacks de `PowerBIEmbed`.
- Despliegue simplificado gracias a `docker-compose.yml`, `Dockerfile.dev` y scripts `run_dev.sh`, que documentan dependencias como Redis, MySQL y Power BI.
- Escalabilidad facilitada por la arquitectura modular y los generadores (scripts `new-*`) que permiten sumar entidades sin romper lo existente.

## Acciones verificadas
- Plantillas `.env` (por ejemplo `server/config/.env.dev`) revisadas para asegurar credenciales vigentes de Power BI, MySQL y JWT antes de levantar contenedores.
- Dependencias instaladas alineadas con las versiones listadas (según `package-lock.json` y `pnpm-lock.yaml` en cliente/servidor).
- Recomendación de ejecutar `git status` y pruebas pertinentes antes de versionar para garantizar que la documentación y los cambios de configuración estén sincronizados.
