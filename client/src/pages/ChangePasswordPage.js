import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Paper, Typography, Grid, Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useNavigate } from "react-router-dom";
import useNavigateAfterAction from "../hooks/useNavigateAfterAction";
import useToggle from "../hooks/useToggle";
import useForm from "../hooks/useForm";
import { changeUserPassword } from "../state/admins/adminsActions";
import FormField from "../components/layout/FormField";

const ChangePasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.admins);

  const buttonHasBeenClicked = useNavigateAfterAction(loading, "/admins/users");

  const [error, toggleError] = useToggle(false);

  const [fields, bindField, areFieldsEmpty] = useForm({
    password: "",
    confirmPassword: "",
  });

  React.useEffect(() => {
    if (error && fields.password === fields.confirmPassword) toggleError();
  }, [error, fields.password, fields.confirmPassword, toggleError]);

  const handleChangePassword = () => {
    if (fields.password !== fields.confirmPassword) {
      toggleError();
    } else {
      dispatch(changeUserPassword(user.id, fields.password));
      buttonHasBeenClicked();
    }
  };

  const handleGoBack = () => {
    navigate("/admins/users");
  };

  return (
    <Paper className="container">
      <Grid container justifyContent="center" spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" align="center">
            Cambio de contraseña para {user?.name}
          </Typography>
        </Grid>

        <Grid item container justifyContent="center" xs={12} md={8} alignItems="center">
          <FormField label="Nueva Contraseña" required>
            <FormField.TextField
              error={error}
              type="password"
              helperText={error && "Ambos campos deben ser iguales"}
              {...bindField("password")}
            />
          </FormField>

          <FormField label="Confirmar Contraseña" required>
            <FormField.TextField
              error={error}
              type="password"
              helperText={error && "Ambos campos deben ser iguales"}
              {...bindField("confirmPassword")}
            />
          </FormField>
        </Grid>
      </Grid>

      <Grid mt={3} container justifyContent="space-between">
        <Button onClick={handleGoBack}>Cancelar</Button>
        <LoadingButton onClick={handleChangePassword} variant="contained" loading={loading} disabled={areFieldsEmpty}>
          Cambiar contraseña
        </LoadingButton>
      </Grid>
    </Paper>
  );
};

export default ChangePasswordPage;
