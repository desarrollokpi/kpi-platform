# Migración de Power BI a Apache Superset

## 1. Inventario y planificación
- Catalogar workspaces, reportes y secciones actuales de Power BI junto con los usuarios/grupos que los consumen.
- Definir los dashboards equivalentes en Superset (charts, datasets y dashboards) y documentar los nuevos IDs esperados.
- Establecer un plan de migración y un periodo de pruebas paralelas.

## 2. Infraestructura Superset
- Añadir contenedores de Superset (webserver, worker, redis, base Postgres) al `docker-compose` o plataforma de despliegue.
- Configurar conexiones a las fuentes de datos existentes y la autenticación (OAuth/JWT o guest tokens).
- Preparar variables de entorno para Superset (URL, credenciales de servicio, secretos de firma) en `server/.env` y scripts de arranque.

## 3. Backend
- Crear `superset.repository.js` que maneje login, generación de guest tokens y consumo de APIs (`/api/v1/dashboard`, `/api/v1/chart`, etc.).
- Implementar `superset.services.js` y `superset.routes.js` para ofrecer endpoints equivalentes a los actuales (`/token`, `/reportData`, `/reportsInGroup`, `/pagesInReport`) pero apuntando a Superset.
- Actualizar servicios existentes (`reports.services.js`, `workspaces.services.js`, `users.services.js`) para mapear report groups y secciones a dashboards/tabs de Superset y almacenar los nuevos campos en la base de datos (incluye migraciones SQL).
- Ajustar validaciones, middlewares y configuración para manejar los nuevos parámetros (por ejemplo, `dashboardId`, `tabId`, parámetros de guest token).

## 4. Frontend
- Sustituir `powerbi-client-react` por el método de embed de Superset (iframe + guest token o SDK oficial). Crear un componente `SupersetEmbed` que reciba `embedUrl`, `guestToken` y configuración visual.
- Reescribir `powerbiActions`, reducers y hooks que gestionan el estado del reporte para consumir los nuevos endpoints `/api/superset/*`.
- Actualizar vistas (`ReportsPage`, `ReportGroups`, componentes de secciones) para mostrar dashboards Superset y su navegación interna.
- Revisar copy/branding para eliminar referencias a Power BI.

## 5. Datos y permisos
- Migrar la información de la base: mapear cada `reportsGroup`, `report` y `section` a los IDs de dashboards Superset (nueva tabla o campos adicionales).
- Configurar roles/permisos en Superset para que coincidan con los accesos definidos en la aplicación (admins, users, superusers).
- Sincronizar la lógica de asignación de reportes a usuarios/grupos con los permisos de Superset.

## 6. Pruebas y despliegue
- Probar todos los flujos: creación/edición de report groups, asignación a usuarios, visualización de dashboards, cambios de contraseña, expiración de sesión.
- Validar expiración y refresco de guest tokens y la compatibilidad con iframe/fullscreen.
- Planificar despliegue gradual con feature flag si es necesario; mantener Power BI en paralelo hasta validar Superset.
- Actualizar documentación (README, runbooks) con instrucciones para administrar Superset y los nuevos endpoints.
