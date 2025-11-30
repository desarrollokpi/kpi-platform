import React, { useEffect, useMemo } from "react";
import { Grid, Paper, Button, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

import useForm from "../../hooks/useForm";
import useNavigateAfterAction from "../../hooks/useNavigateAfterAction";
import useSuperuser from "../../hooks/useSuperuser";
import useAccountId from "../../hooks/useAccountId";

import { createInstance, getAccountsLists, updateInstance } from "../../state/instances/instancesActions";

import ManageInstanceForm from "./ManageInstanceForm";
import CircularLoading from "../layout/CircularLoading";

const COLUMNS = ["name", "baseUrl", "apiUserName", "apiPassword", "accountIds"];

const ManageInstance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { instanceId } = useParams();
  const { isSuperuser } = useSuperuser();

  const { instances, accountsList, loading } = useSelector(({ instances }) => instances, shallowEqual);
  const accountId = useAccountId();
  const prefixRoute = useMemo(() => (isSuperuser ? "superusers" : "admins"), [isSuperuser]);

  const thisInfo = useMemo(() => {
    if (!instanceId) return null;

    const id = Number.parseInt(instanceId, 10);
    if (Number.isNaN(id)) return null;

    return instances.find((instance) => instance.id === id) || null;
  }, [instanceId, instances]);

  const formData = useMemo(
    () =>
      COLUMNS.reduce((acc, column) => {
        if (column === "accountIds") {
          acc.accountIds = Array.isArray(thisInfo?.accountIds) ? thisInfo.accountIds.filter((id) => id != null) : accountId ? [accountId] : [];
          return acc;
        }

        acc[column] = thisInfo?.[column] ?? "";
        return acc;
      }, {}),
    [thisInfo, accountId]
  );

  const buttonHasBeenClicked = useNavigateAfterAction(loading, `/${prefixRoute}/instances`);

  const [instance, bindField, areFieldsEmpty] = useForm(formData);

  useEffect(() => {
    if (isSuperuser) {
      dispatch(getAccountsLists());
    }
  }, [dispatch, isSuperuser]);

  const handleManageInstance = async () => {
    const id = instanceId ? Number(instanceId) : null;
    const accountIds = Array.isArray(instance.accountIds) ? instance.accountIds.filter((value) => value != null) : [];
    const instanceData = {
      ...instance,
      accountIds,
    };

    const action = await dispatch(id ? updateInstance(id, instanceData) : createInstance(instanceData));

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

  if (loading && instanceId && !thisInfo) {
    return (
      <Paper className="container">
        <CircularLoading />
      </Paper>
    );
  }

  if (instanceId && !thisInfo && !loading) {
    return (
      <Paper className="container">
        <Typography variant="h6" align="center" color="error">
          Instancia no encontrada
        </Typography>
        <Grid container justifyContent="center" mt={3}>
          <Button onClick={() => navigate(`/${prefixRoute}/instances`)}>Volver a la lista</Button>
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper className="container">
      <ManageInstanceForm
        instanceId={instanceId}
        bindField={bindField}
        accounts={accountsList}
        isSuperuser={isSuperuser}
        accountIds={instance?.accountIds || []}
      />

      <Grid mt={3} container justifyContent="space-between">
        <Button onClick={() => navigate(`/${prefixRoute}/instances`)}>Cancelar</Button>
        <LoadingButton onClick={handleManageInstance} variant="contained" loading={loading} disabled={areFieldsEmpty}>
          {instanceId ? "Guardar cambios" : "Crear instancia"}
        </LoadingButton>
      </Grid>
    </Paper>
  );
};

export default ManageInstance;
