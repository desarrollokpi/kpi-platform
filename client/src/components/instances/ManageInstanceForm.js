import React from "react";
import { Typography, Grid } from "@mui/material";
import FormField from "../layout/FormField";

const ManageInstanceForm = ({ instanceId, accounts, bindField, accountIds, isSuperuser }) => {
  return (
    <Grid container justifyContent="center" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" mb={3}>
          {instanceId ? "Editar Instancia de Superset" : "Crear Nueva Instancia de Superset"}
        </Typography>
      </Grid>

      <Grid item container justifyContent="center" xs={12} md={8} alignItems="center">
        <FormField label="Nombre de la Instancia" required>
          <FormField.TextField {...bindField("name")} placeholder="Ej: Superset Producción" helperText="Nombre identificador de la instancia" />
        </FormField>

        <FormField label="URL Base" required>
          <FormField.TextField {...bindField("baseUrl")} placeholder="https://superset.example.com" helperText="URL completa de la instancia de Superset" />
        </FormField>

        <FormField label="Username" required>
          <FormField.TextField {...bindField("apiUserName")} placeholder="admin" helperText="Usuario para autenticación en Superset" />
        </FormField>

        <FormField label="Password" required>
          <FormField.TextField
            type="password"
            autoComplete="off"
            {...bindField("apiPassword")}
            placeholder="Contraseña"
            helperText="Contraseña para autenticación en Superset"
          />
        </FormField>

        {isSuperuser && (
          <FormField label="Cuentas Asociadas">
            <FormField.SelectMultiple {...bindField("accountIds")} options={accounts} value={accountIds} />
          </FormField>
        )}
      </Grid>

      <Grid item xs={12}>
        <Typography variant="body2" align="center" color="textSecondary" mt={2}>
          Una vez creada la instancia, podrás asignarla a cuentas (tenants) y sincronizar workspaces desde Superset.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default ManageInstanceForm;
