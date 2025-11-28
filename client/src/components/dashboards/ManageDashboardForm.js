import React from "react";
import { Typography, Switch, Grid, Alert } from "@mui/material";
import FormField from "../layout/FormField";

const ManageDashboardForm = ({ dashboardId, bindField, active, handleSwitchChange, reports = [], dashboards = [], isAdmin, reportId }) => {
  return (
    <Grid container justifyContent="center" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" mb={3}>
          {dashboardId ? "Editar Dashboard" : "Crear Nuevo Dashboard"}
        </Typography>
      </Grid>

      <Grid item container justifyContent="center" xs={12} md={8} alignItems="center">
        <FormField label="Nombre del Dashboard">
          <FormField.TextField {...bindField("name")} placeholder="Ej: Superset Producción" helperText="Nombre identificador de la instancia" />
        </FormField>

        <FormField label="Reporte Asociado" required>
          <FormField.Select
            {...bindField("reportId")}
            options={reports}
            optionValue="value"
            display="label"
            helperText="Reporte al que pertenece este dashboard"
          />
        </FormField>

        {reportId && reportId !== "" && dashboards.length !== 0 && (
          <FormField label="Dashboard" required>
            <FormField.Select {...bindField("apacheId")} options={dashboards} optionValue="value" display="label" helperText="Dashboard a asociar" />
          </FormField>
        )}

        <FormField label="Dashboard Activo" mt={2}>
          <Switch checked={active} onChange={handleSwitchChange} />
        </FormField>
      </Grid>

      <Grid item xs={12}>
        {reportId && reportId !== "" && dashboards.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No hay dashboards disponibles para el reporte seleccionado en tu cuenta. Contacta al superusuario para que los configure para tu tenant.
          </Alert>
        )}
        {reportId === "" && dashboards.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Selecciona un reporte para ver que dashboards puedes asociar
          </Alert>
        )}
        {isAdmin && reports.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No hay reportes disponibles para tu cuenta. Contacta al superusuario para que configure reportes para tu tenant.
          </Alert>
        )}
        {isAdmin && reports.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Solo puedes seleccionar reportes asignados a tu cuenta (tenant).
          </Alert>
        )}
        <Typography variant="body2" align="center" color="textSecondary" mt={2}>
          Los dashboards se asignan a usuarios desde la sección de gestión de permisos.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default ManageDashboardForm;
