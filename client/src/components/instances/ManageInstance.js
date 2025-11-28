import React, { useEffect, useMemo } from "react";
import { Grid, Paper, Button, Typography } from "@mui/material";
import useForm from "../../hooks/useForm";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { createInstance, getAccountsLists, updateInstance } from "../../state/instances/instancesActions";
import { useParams, useNavigate } from "react-router-dom";
import useToggle from "../../hooks/useToggle";
import useNavigateAfterAction from "../../hooks/useNavigateAfterAction";
import useSuperuser from "../../hooks/useSuperuser";
import LoadingButton from "@mui/lab/LoadingButton";
import ManageInstanceForm from "./ManageInstanceForm";
import CircularLoading from "../layout/CircularLoading";

const ManageInstance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuperuser } = useSuperuser();
  const { instanceId } = useParams();

  const { instances, accountsList, loading } = useSelector(({ instances }) => instances);
  const { user } = useSelector(({ auth }) => auth, shallowEqual);
  const accountId = useMemo(() => user?.accountId || null, [user]);
  const prefixRoute = useMemo(() => (isSuperuser ? "superusers" : "admins"), [isSuperuser]);

  const initialState = {
    name: "",
    baseUrl: "",
    apiUserName: "",
    apiPassword: "",
    accountId: accountId || "",
  };

  let thisInstance = undefined;

  if (instanceId) {
    thisInstance = instances.find((instance) => instance.id === parseInt(instanceId));
  }

  const buttonHasBeenClicked = useNavigateAfterAction(loading, `/${prefixRoute}/instances`);

  const [instance, bindField, areFieldsEmpty] = useForm(instanceId ? thisInstance : initialState);

  const [active, handleSwitchChange] = useToggle(instanceId ? thisInstance?.active : true);

  useEffect(() => {
    if (isSuperuser) {
      dispatch(getAccountsLists());
    }
  }, [dispatch, isSuperuser]);

  // Solo los superusers pueden gestionar instances
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
    const instanceData = { ...instance, active };

    dispatch(instanceId ? updateInstance(instanceData) : createInstance(instanceData));

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
