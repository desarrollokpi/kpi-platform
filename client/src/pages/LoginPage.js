import { useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Grid, Paper } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import AppBar from "@layout/AppBar";
import Alerts from "@layout/Alerts";
import Footer from "@components/layout/Footer";
import FormField from "@layout/FormField";

import { signIn } from "./../state/auth/authActions";
import { isDev } from "@util";
import roles from "../constants/roles";

import useForm from "@hooks/useForm";
import useSubdomain from "../hooks/useSubdomain";
import useUserRoles from "../hooks/useUserRoles";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const subdomain = useSubdomain();

  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const { resolveUserRole, getDevCredentials } = useUserRoles();

  const initialCredentials = useMemo(() => {
    if (!isDev()) return { identifier: "", password: "" };

    const creds = getDevCredentials(roles.ROOT);
    return creds ? { identifier: creds.name, password: creds.password } : { identifier: "", password: "" };
  }, [getDevCredentials]);

  const [credentials, bindField, areFieldsEmpty] = useForm(initialCredentials);

  useEffect(() => {
    if (!isAuthenticated || loading || !user) return;

    const role = resolveUserRole(user.roles);
    if (role?.redirectTo) {
      navigate(role.redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, user, resolveUserRole, navigate]);

  const handleLogin = useCallback(
    (e) => {
      e.preventDefault();
      if (loading) return;

      dispatch(signIn({ ...credentials, subdomain }));
    },
    [dispatch, credentials, subdomain, loading]
  );

  return (
    <>
      <AppBar />
      <Alerts />

      <Grid justifyContent="center" alignItems="center" container mt={4}>
        <Grid item xs={12} md={5} lg={4} p={2}>
          <Paper className="login">
            <Grid container alignItems="center" component="form" onSubmit={handleLogin}>
              <FormField label="Usuario">
                <FormField.TextField {...bindField("identifier")} />
              </FormField>

              <FormField label="Contraseña">
                <FormField.TextField type="password" autoComplete="current-password" {...bindField("password")} />
              </FormField>

              <Grid mt={4} justifyContent="center" container>
                <LoadingButton type="submit" variant="contained" disabled={areFieldsEmpty || loading} loading={loading}>
                  Ingresar
                </LoadingButton>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Footer />
    </>
  );
};

export default LoginPage;
