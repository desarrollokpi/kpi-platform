import React from "react";
import { Typography, Grid, Alert } from "@mui/material";
import FormField from "../layout/FormField";

const ManageReportForm = ({ reportId, bindField, workspaces, isSuperuser, isAdmin, loading }) => {
  return (
    <Grid container justifyContent="center" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" mb={3}>
          {reportId ? "Editar Reporte" : "Crear Nuevo Reporte"}
        </Typography>
      </Grid>

      <Grid item container justifyContent="center" xs={12} md={8} alignItems="center">
        <FormField label="Nombre del Reporte" required>
          <FormField.TextField {...bindField("name")} placeholder="Ej: Reporte de Ventas 2024" helperText="Nombre identificador del reporte" />
        </FormField>

        <FormField label="Workspace de Superset" required>
          <FormField.Select
            {...bindField("workspaceId")}
            options={workspaces}
            optionValue="id"
            display="name"
            helperText="Workspace donde está ubicado este reporte en Superset"
            loading={loading}
          />
        </FormField>
      </Grid>

      <Grid item xs={12}>
        {isAdmin && !isSuperuser && workspaces.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No hay workspaces disponibles para tu cuenta. Contacta al superusuario para que configure workspaces para tu tenant.
          </Alert>
        )}
        {isAdmin && !isSuperuser && workspaces.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Solo puedes seleccionar workspaces asignados a tu cuenta (tenant).
          </Alert>
        )}
        <Typography variant="body2" align="center" color="textSecondary" mt={2}>
          Los reportes agrupan dashboards relacionados de un mismo workspace en Superset
        </Typography>
      </Grid>
    </Grid>
  );
};

export default ManageReportForm;
