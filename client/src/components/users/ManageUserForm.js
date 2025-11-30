import React from "react";
import { Typography, Grid, Alert } from "@mui/material";
import FormField from "../layout/FormField";

const ManageUserForm = ({ userId, bindField, isSuperuser, accounts, roles }) => {
  const roleField = bindField("roleId");
  const selectedRole = roles?.find((role) => String(role.value) === String(roleField.value));
  const isRootRole = selectedRole && /root/i.test(String(selectedRole.labelRaw || selectedRole.label || ""));

  return (
    <Grid container justifyContent="center" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" mb={3}>
          {userId ? "Editar Usuario" : "Crear Nuevo Usuario"}
        </Typography>
      </Grid>

      <Grid item container justifyContent="center" xs={12} md={8} alignItems="center">
        <FormField label="Nombre Completo" required>
          <FormField.TextField {...bindField("name")} placeholder="Ej: Juan Pérez" helperText="Nombre completo del usuario" />
        </FormField>

        <FormField label="Nombre de Usuario" required>
          <FormField.TextField {...bindField("userName")} placeholder="Ej: jperez" helperText="Nombre de usuario para iniciar sesión" />
        </FormField>

        <FormField label="Correo Electrónico" required>
          <FormField.TextField {...bindField("mail")} type="email" placeholder="usuario@ejemplo.com" helperText="Correo electrónico del usuario" />
        </FormField>

        <FormField label="Confirmar Correo Electrónico" required>
          <FormField.TextField {...bindField("confirmMail")} type="email" placeholder="usuario@ejemplo.com" helperText="Confirma el correo electrónico" />
        </FormField>

        <FormField label="Rol para el usuario" required>
          <FormField.Select {...roleField} options={roles} />
        </FormField>

        {isSuperuser && !isRootRole && (
          <FormField label="Cuenta Asociada">
            <FormField.Select {...bindField("accountId")} options={accounts} />
          </FormField>
        )}

        {!userId && (
          <>
            <FormField label="Contraseña" required>
              <FormField.TextField
                type="password"
                autoComplete="new-password"
                {...bindField("password")}
                placeholder="Contraseña"
                helperText="Contraseña para el usuario"
              />
            </FormField>

            <FormField label="Confirmar Contraseña" required>
              <FormField.TextField
                type="password"
                autoComplete="new-password"
                {...bindField("confirmPassword")}
                placeholder="Confirmar contraseña"
                helperText="Confirma la contraseña"
              />
            </FormField>
          </>
        )}
      </Grid>

      <Grid item xs={12}>
        <Typography variant="body2" align="center" color="textSecondary" mt={2}>
          {userId
            ? 'Los dashboards se asignan desde la lista de usuarios usando el botón "Asignar dashboards".'
            : "Una vez creado el usuario, podrás asignarle dashboards desde la lista de usuarios."}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default ManageUserForm;
