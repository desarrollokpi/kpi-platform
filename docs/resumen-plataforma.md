# Resumen de la plataforma KPI Managers

## Propósito general
- Plataforma web para administrar y consumir reportes de KPI Managers.
- Perfiles principales:
  - **Superusuarios** gestionan instancias y administradores.
  - **Administradores** definen grupos de reportes, usuarios, permisos y branding por subdominio.
  - **Usuarios finales** acceden a los dashboards asignados y pueden cambiar su contraseña.

## Backend (carpeta server)
- API REST en Express que expone `/api/<entidad>` para admins, usuarios, grupos, reportes, contratos y más.
- Persistencia en MySQL mediante `mysql2` y scripts SQL versionados dentro de `server/queries`.
- Autenticación con JWT en cookies y sesiones Redis para caducidad y refresco (middlewares `hasToken`, `isAdmin`, `isUser`, `refreshSession`).
- Servicios modulares encapsulan la lógica (por ejemplo `users.services.js` vincula report groups y `reports.services.js` organiza dashboards por workspace).
- Integración con Power BI (`powerbi.repository.js`) para tokens AAD, URLs de embebido y páginas a través de Axios.

## Frontend (carpeta client)
- Aplicación React (Create React App + CRACO) con Redux + Thunk para auth, usuarios, reportes, workspaces y catálogos.
- Enrutado protegido por rol usando `react-router-dom@6` y componentes `SuperuserRoute`, `AdminRoute` y `PrivateRoute`.
- Diseño en Material UI 5 con un tema centralizado (`src/theme.js`) que controla tipografías, colores y overrides.
- Embebido Power BI mediante `powerbi-client-react`: `powerbiActions` obtiene `accessToken` / `embedUrl` y `PowerBIEmbed` renderiza los dashboards.
- Multi-tenant por subdominio: `useSubdomain` determina la marca y dispara carga de logo y términos y condiciones.

## Infraestructura y operaciones
- Docker Compose levanta `client`, `server` y Redis con montajes para hot reload y variables desde `server/.env`.
- Scripts en `server/package.json` usan pnpm para ejecutar server y client en paralelo (`pnpm dev`) y generar scaffolding (modelos, controladores, rutas, Redux).
- Recursos auxiliares: diagramas de base de datos en `docs/database`, pasos de despliegue en `resources/deploy_steps.txt` y scripts PowerShell en `scripts/`.

## Integraciones clave
- **Power BI** para autenticación, workspaces, reportes y páginas.
- **Redis** para control de sesiones y TTL de admins/usuarios.
- **MySQL** para datos maestros (usuarios, reportes, contratos, ubicaciones, etc.).

## Funciones específicas con Power BI
- Genera tokens de acceso Azure AD y cabeceras OAuth mediante `server/src/config/powerbi.config.js` y los expone vía `GET /api/powerbi/token`.
- Obtiene información de workspaces, reportes y páginas utilizando Axios contra `https://api.powerbi.com` (`server/src/common/powerbi.repository.js`) y los entrega en endpoints como `/api/powerbi/workspaces`, `/api/powerbi/reportsInGroup` y `/api/powerbi/pagesInReport`.
- Calcula URLs de embebido (`getEmbedUrl`) y datasets asociados para que el frontend renderice cada dashboard dinámicamente.
- En cliente, `client/src/state/powerbi/powerbiActions.js` invoca estos endpoints, guarda `accessToken`, `embedUrl` y metadatos en Redux y, finalmente, `client/src/components/reports/Report.js` usa `PowerBIEmbed` para mostrar los reportes o secciones solicitados.

## Estado verificado
- Dependencias en `client/package.json` y `server/package.json` apuntan a React 17, MUI 5, Express 4.17, Axios, JWT, Redis y MySQL actualizados.
- Archivos `.env` (no versionados) deben aportar credenciales de base de datos, Power BI y JWT para ejecutar la plataforma.
