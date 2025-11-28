import React from "react";
import { Typography, Switch, Grid, Box } from "@mui/material";
import FormField from "../layout/FormField";

const ManageAccountForm = ({ accountId, bindField, active, handleSwitchChange, logoAddress }) => {
  return (
    <Grid container justifyContent="center" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" mb={3}>
          {accountId ? "Editar Cuenta (Tenant)" : "Crear Nueva Cuenta (Tenant)"}
        </Typography>
      </Grid>

      <Grid item container justifyContent="center" xs={12} md={8} alignItems="center">
        <FormField label="Nombre de la Cuenta" required>
          <FormField.TextField {...bindField("name")} placeholder="Ej: Empresa ABC" helperText="Nombre identificador de la empresa o cliente" />
        </FormField>

        <FormField label="Subdominio" required>
          <FormField.TextField
            {...bindField("subDomain")}
            placeholder="Ej: empresa-abc"
            helperText="Solo letras minúsculas, números y guiones. Ej: empresa-abc"
          />
        </FormField>

        <FormField label="Nombre de Base de Datos">
          <FormField.TextField {...bindField("dataBase")} placeholder="Ej: empresa_abc_db" helperText="Nombre de la base de datos (opcional)" />
        </FormField>

        <FormField label="Usuario de Base de Datos">
          <FormField.TextField {...bindField("keyUser")} placeholder="Usuario de base de datos" helperText="Usuario para conexión a base de datos (opcional)" />
        </FormField>

        <FormField label="Contraseña de Base de Datos">
          <FormField.TextField
            type="password"
            autoComplete="off"
            {...bindField("password")}
            placeholder="Contraseña de base de datos"
            helperText="Contraseña para conexión a base de datos (opcional)"
          />
        </FormField>

        <FormField label="Logo (URL pública)">
          <FormField.TextField
            {...bindField("logoAddress")}
            placeholder="https://empresa.com/logo.png"
            helperText="URL pública del logo de la empresa (opcional). Debe ser accesible sin autenticación."
          />
        </FormField>

        <Box mt={1} mb={2}>
          <Typography variant="caption" color="textSecondary">
            Vista previa del logo:
          </Typography>
          <Box mt={1} sx={{ border: "1px solid #eee", borderRadius: 1, p: 1, display: "inline-block" }}>
            <img
              src={logoAddress && /^https?:\/\//.test(logoAddress) ? logoAddress : "/fallback-logo.png"}
              alt="Account logo preview"
              style={{ maxHeight: 48, maxWidth: 200, objectFit: "contain" }}
              onError={(e) => {
                if (e.target.src.indexOf("/fallback-logo.png") === -1) {
                  e.target.src = "/fallback-logo.png";
                }
              }}
            />
          </Box>
        </Box>

        <FormField label="Cuenta Activa" mt={2}>
          <Switch checked={active} onChange={handleSwitchChange} />
        </FormField>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="body2" align="center" color="textSecondary" mt={2}>
          Una vez creada la cuenta, podrás asignarle instancias de Superset y usuarios desde la lista de cuentas.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default ManageAccountForm;
