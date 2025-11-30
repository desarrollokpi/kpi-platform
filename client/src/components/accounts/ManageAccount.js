import React, { useMemo } from "react";
import { Grid, Paper, Button, Typography } from "@mui/material";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import useForm from "../../hooks/useForm";
import useNavigateAfterAction from "../../hooks/useNavigateAfterAction";
import useSuperuser from "../../hooks/useSuperuser";
import { createAccount, updateAccount } from "../../state/accounts/accountsActions";
import ManageAccountForm from "./ManageAccountForm";
import CircularLoading from "../layout/CircularLoading";

const COLUMNS = ["name", "subDomain", "dataBase", "keyUser", "password", "logoAddress"];

const ManageAccount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuperuser } = useSuperuser();
  const { accountId } = useParams();

  const { accounts, loading, message } = useSelector(({ accounts }) => accounts, shallowEqual);

  const thisInfo = useMemo(() => {
    if (!accountId) return null;
    const id = Number(accountId);
    if (Number.isNaN(id)) return null;
    return accounts.find((account) => account.id === id) || null;
  }, [accountId, accounts]);

  const formData = useMemo(() => {
    return COLUMNS.reduce((acc, column) => {
      acc[column] = thisInfo?.[column] ?? "";
      return acc;
    }, {});
  }, [thisInfo]);

  const [account, bindField, areFieldsEmpty] = useForm(formData, {
    allowEmpty: ["logoAddress"],
  });

  const buttonHasBeenClicked = useNavigateAfterAction(loading, `/superusers/accounts`);

  const handleManageAccount = async () => {
    const accountData = { ...account };
    const id = accountId ? Number(accountId) : null;

    const action = await dispatch(id ? updateAccount(id, accountData) : createAccount(accountData));

    if (action) {
      buttonHasBeenClicked();
    }
  };

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

  if (loading && accountId && !thisInfo) {
    return (
      <Paper className="container">
        <CircularLoading />
      </Paper>
    );
  }

  if (accountId && !thisInfo && !loading) {
    return (
      <Paper className="container">
        <Typography variant="h6" align="center" color="error">
          Cuenta no encontrada
        </Typography>
        <Grid container justifyContent="center" mt={3}>
          <Button onClick={() => navigate(`/superusers/accounts`)}>Volver a la lista</Button>
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper className="container">
      <ManageAccountForm accountId={accountId} bindField={bindField} message={message} />

      <Grid mt={3} container justifyContent="space-between">
        <Button onClick={() => navigate(`/superusers/accounts`)}>Cancelar</Button>
        <LoadingButton onClick={handleManageAccount} variant="contained" loading={loading} disabled={areFieldsEmpty}>
          {accountId ? "Guardar cambios" : "Crear cuenta"}
        </LoadingButton>
      </Grid>
    </Paper>
  );
};

export default ManageAccount;
