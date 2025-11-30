import React from "react";
import { Typography, Grid } from "@mui/material";
import FormField from "../layout/FormField";

const ManageWorkspaceForm = ({ workspaceId, bindField, instances, isSuperuser, accounts, loading, accountId }) => {
  return (
    <Grid container justifyContent="center" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" mb={3}>
          {workspaceId ? "Editar Workspace" : "Crear Nuevo Workspace"}
        </Typography>
      </Grid>

      <Grid item container justifyContent="center" xs={12} md={8} alignItems="center">
        <FormField label="Nombre del Workspace" required>
          <FormField.TextField {...bindField("name")} placeholder="Ej: Workspace de Ventas" helperText="Nombre identificador del workspace en Superset" />
        </FormField>

        {isSuperuser && (
          <FormField label="Cuenta Asociada" required>
            <FormField.Select {...bindField("accountId")} options={accounts} optionValue="value" display="label" />
          </FormField>
        )}

        <FormField label="Instancia Asociada" required>
          <FormField.Select {...bindField("instanceId")} options={instances} optionValue="value" display="label" loading={loading || accountId === ""} />
        </FormField>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="body2" align="center" color="textSecondary" mt={2}>
          Los workspaces agrupan dashboards y se sincronizan desde instancias de Superset.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default ManageWorkspaceForm;
