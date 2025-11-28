import React, { useMemo } from "react";
import { Grid, Paper, Button, Typography } from "@mui/material";
import useForm from "../../hooks/useForm";
import { useDispatch, useSelector } from "react-redux";
import { createAccount, updateAccount } from "../../state/accounts/accountsActions";
import { useParams, useNavigate } from "react-router-dom";
import useToggle from "../../hooks/useToggle";
import useNavigateAfterAction from "../../hooks/useNavigateAfterAction";
import useSuperuser from "../../hooks/useSuperuser";
import LoadingButton from "@mui/lab/LoadingButton";
import ManageAccountForm from "./ManageAccountForm";
import CircularLoading from "../layout/CircularLoading";

const ManageAccount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuperuser } = useSuperuser();
  const { accountId } = useParams();

  const { accounts, loading } = useSelector((state) => state.accounts);

  const prefixRoute = useMemo(() => (isSuperuser ? "superusers" : "admins"), [isSuperuser]);

  const initialState = {
    name: "",
    subDomain: "",
    dataBase: "",
    keyUser: "",
    password: "",
    logoAddress: "",
  };

  let thisAccount = undefined;

  if (accountId) {
    thisAccount = accounts.find((account) => account.id === parseInt(accountId));
  }

  const buttonHasBeenClicked = useNavigateAfterAction(loading, `/${prefixRoute}/accounts`);

  const [account, bindField, areFieldsEmpty] = useForm(accountId ? thisAccount : initialState);

  const [active, handleSwitchChange] = useToggle(accountId ? thisAccount?.active : true);

  // Solo los superusers pueden gestionar accounts
  if (!isSuperuser) {
    return (
      <Paper className="container">
        <Typography variant="h6" align="center" color="error">
          No tienes permisos para acceder a esta página
        </Typography>
        <Grid container justifyContent="center" mt={3}>
          <Button onClick={() => navigate("/")}>Volver al inicio</Button>
        </Grid>
      </Paper>
    );
  }

  const handleManageAccount = () => {
    const accountData = { ...account, active };

    dispatch(accountId ? updateAccount(accountData) : createAccount(accountData));

    buttonHasBeenClicked();
  };

  if (loading && accountId && !thisAccount) {
    return (
      <Paper className="container">
        <CircularLoading />
      </Paper>
    );
  }

  if (accountId && !thisAccount && !loading) {
    return (
      <Paper className="container">
        <Typography variant="h6" align="center" color="error">
          Cuenta no encontrada
        </Typography>
        <Grid container justifyContent="center" mt={3}>
          <Button onClick={() => navigate(`/${prefixRoute}/accounts`)}>Volver a la lista</Button>
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper className="container">
      <ManageAccountForm
        accountId={accountId}
        bindField={bindField}
        active={active}
        handleSwitchChange={handleSwitchChange}
        logoAddress={account.logoAddress}
      />

      <Grid mt={3} container justifyContent="space-between">
        <Button onClick={() => navigate(`/${prefixRoute}/accounts`)}>Cancelar</Button>
        <LoadingButton onClick={handleManageAccount} variant="contained" loading={loading} disabled={areFieldsEmpty}>
          {accountId ? "Guardar cambios" : "Crear cuenta"}
        </LoadingButton>
      </Grid>
    </Paper>
  );
};

export default ManageAccount;
