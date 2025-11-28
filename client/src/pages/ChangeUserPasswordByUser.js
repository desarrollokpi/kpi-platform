import React from "react";
import { useSelector, useDispatch } from "react-redux";

import { Paper, Typography, Grid, Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import { useNavigate } from "react-router-dom";
import useNavigateAfterAction from "../hooks/useNavigateAfterAction";
import useToggle from "../hooks/useToggle";
import useForm from "../hooks/useForm";
import { updateUserPasswordByUser } from "../state/users/usersActions";
import FormField from "../components/layout/FormField";

const ChangeUserPasswordByUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.users);

  const buttonHasBeenClicked = useNavigateAfterAction(loading, "/users/dashboards");

  const [error, toggleError] = useToggle(false);

  const [fields, bindField, areFieldsEmpty] = useForm({
    password: "",
    confirmPassword: "",
  });

  React.useEffect(() => {
    if (error && fields.password === fields.confirmPassword) toggleError();
  }, [error, fields.password, fields.confirmPassword, toggleError]);

  const handleChangeUserPassword = () => {
    if (fields.password !== fields.confirmPassword) {
      toggleError();
    } else {
      dispatch(updateUserPasswordByUser(fields.password));
      buttonHasBeenClicked();
    }
  };

  const handleGoBack = () => {
    navigate("/users/dashboards");
  };

  return (
    <Paper className="container">
      <Grid container justifyContent="center" spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" align="center">
            Cambio de contraseña para {user?.name}
          </Typography>
        </Grid>

        <Grid item container justifyContent="center" md={8} alignItems="center">
          <FormField label="Contraseña">
            <FormField.TextField error={error} type="password" helperText={error && "Ambos campos debes ser iguales"} {...bindField("password")} />
          </FormField>

          <FormField label="Confirmar contraseña">
            <FormField.TextField error={error} type="password" helperText={error && "Ambos campos debes ser iguales"} {...bindField("confirmPassword")} />
          </FormField>
        </Grid>
      </Grid>

      <Grid mt={3} container justifyContent="space-between">
        <Button onClick={handleGoBack}>Cancelar</Button>
        <LoadingButton onClick={handleChangeUserPassword} variant="contained" loading={loading} disabled={areFieldsEmpty}>
          Cambiar contraseña
        </LoadingButton>
      </Grid>
    </Paper>
  );
};

export default ChangeUserPasswordByUser;
