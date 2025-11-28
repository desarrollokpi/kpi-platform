import React, { useEffect, useMemo } from "react";
import { Grid, Paper, Button, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

import useForm from "../../hooks/useForm";
import useToggle from "../../hooks/useToggle";
import useNavigateAfterAction from "../../hooks/useNavigateAfterAction";
import useSuperuser from "../../hooks/useSuperuser";

import { createInstance, getAccountsLists, updateInstance } from "../../state/instances/instancesActions";

import ManageInstanceForm from "./ManageInstanceForm";
import CircularLoading from "../layout/CircularLoading";

const ManageInstance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { instanceId } = useParams();
  const { isSuperuser } = useSuperuser();

  const { instances, accountsList, loading } = useSelector(({ instances }) => instances, shallowEqual);

  const { user } = useSelector(({ auth }) => auth, shallowEqual);

  const accountId = useMemo(() => user?.accountId ?? null, [user]);

  const prefixRoute = useMemo(() => (isSuperuser ? "superusers" : "admins"), [isSuperuser]);

  const initialState = useMemo(
    () => ({
      name: "",
      baseUrl: "",
      apiUserName: "",
      apiPassword: "",
      accountsId: accountId ? [accountId] : [],
    }),
    [accountId]
  );

  const thisInstance = useMemo(() => {
    if (!instanceId) return undefined;

    const id = Number.parseInt(instanceId, 10);
    if (Number.isNaN(id)) return undefined;

    const found = instances.find((instance) => instance.id === id);
    if (!found) return undefined;

    const rawAccounts = Array.isArray(found.accountsId) ? found.accountsId : [];

    const accounts = rawAccounts
      .filter(Boolean)
      .map((accountValue) => {
        const match = accountsList?.find(({ value }) => value === accountValue);
        return match?.label ?? null;
      })
      .filter((label) => label !== null);

    return {
      name: found.name,
      baseUrl: found.baseUrl,
      apiUserName: found.apiUserName,
      apiPassword: found.apiPassword,
      accountsId: accounts,
      active: found.active,
    };
  }, [instanceId, instances, accountsList]);

  const buttonHasBeenClicked = useNavigateAfterAction(loading, `/${prefixRoute}/instances`);

  const [instance, bindField, areFieldsEmpty, setFields] = useForm(initialState);

  useEffect(() => {
    if (instanceId && thisInstance) {
      setFields(thisInstance);
    }
  }, [instanceId, thisInstance, setFields]);

  const [active, handleSwitchChange] = useToggle(instanceId ? thisInstance?.active : true);

  useEffect(() => {
    if (isSuperuser) {
      dispatch(getAccountsLists());
    }
  }, [dispatch, isSuperuser]);

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

  const handleManageInstance = () => {
    const accountsId = Array.isArray(instance.accountsId)
      ? instance.accountsId
          .filter(Boolean)
          .map((accountLabel) => {
            const match = accountsList?.find(({ label }) => label === accountLabel);
            return match?.value ?? null;
          })
          .filter((id) => id !== null)
      : [];

    const instanceData = {
      ...instance,
      accountsId,
      active,
    };

    const action = instanceId ? updateInstance(instanceId, instanceData) : createInstance(instanceData);

    dispatch(action);
    buttonHasBeenClicked();
  };

  if (loading && instanceId && !thisInstance) {
    return (
      <Paper className="container">
        <CircularLoading />
      </Paper>
    );
  }

  if (instanceId && !thisInstance && !loading) {
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
        active={active}
        handleSwitchChange={handleSwitchChange}
        isSuperuser={isSuperuser}
        accountsId={instance?.accountsId || []}
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
