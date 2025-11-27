import React, { useEffect, useMemo } from "react";
import { Grid, Paper, Button, Typography } from "@mui/material";
import useForm from "../../hooks/useForm";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { createWorkspace, getInstancesLists, updateWorkspace, getAccountsLists } from "../../state/workspaces/workspacesActions";
import { useParams, useNavigate } from "react-router-dom";
import useToggle from "../../hooks/useToggle";
import useNavigateAfterAction from "../../hooks/useNavigateAfterAction";
import useSuperuser from "../../hooks/useSuperuser";
import LoadingButton from "@mui/lab/LoadingButton";
import ManageWorkspaceForm from "./ManageWorkspaceForm";
import CircularLoading from "../layout/CircularLoading";

const ManageWorkspace = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuperuser } = useSuperuser();
  const { workspaceId } = useParams();

  const { workspaces, accountsList, instancesList, loading } = useSelector(({ workspaces }) => workspaces, shallowEqual);
  const { user } = useSelector(({ auth }) => auth, shallowEqual);
  const accountId = useMemo(() => user?.accountId || null, [user]);
  const prefixRoute = useMemo(() => (isSuperuser ? "superusers" : "admins"), [isSuperuser]);

  const initialState = {
    name: "",
    accountId: accountId || "",
    instanceId: "",
  };

  let thisWorkspace = undefined;

  if (workspaceId) {
    thisWorkspace = workspaces.find((workspace) => workspace.id === parseInt(workspaceId));
  }

  const buttonHasBeenClicked = useNavigateAfterAction(loading, `/${prefixRoute}/workspaces`);

  const [workspace, bindField, areFieldsEmpty] = useForm(workspaceId ? thisWorkspace : initialState);

  const [active, handleSwitchChange] = useToggle(workspaceId ? thisWorkspace?.active : true);

  useEffect(() => {
    if (isSuperuser) {
      dispatch(getAccountsLists());
    }
  }, [getAccountsLists]);

  useEffect(() => {
    if (workspace?.accountId) {
      dispatch(getInstancesLists(workspace?.accountId));
    }
  }, [getInstancesLists, workspace]);

  // Solo los superusers pueden gestionar workspaces
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

  const handleManageWorkspace = () => {
    const workspaceData = { ...workspace, active };

    dispatch(workspaceId ? updateWorkspace(workspaceData) : createWorkspace(workspaceData));

    buttonHasBeenClicked();
  };

  if (loading && workspaceId && !thisWorkspace) {
    return (
      <Paper className="container">
        <CircularLoading />
      </Paper>
    );
  }

  if (workspaceId && !thisWorkspace && !loading) {
    return (
      <Paper className="container">
        <Typography variant="h6" align="center" color="error">
          Workspace no encontrado
        </Typography>
        <Grid container justifyContent="center" mt={3}>
          <Button onClick={() => navigate(`/${prefixRoute}/workspaces`)}>Volver a la lista</Button>
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper className="container">
      <ManageWorkspaceForm
        workspaceId={workspaceId}
        bindField={bindField}
        active={active}
        isSuperuser={isSuperuser}
        accounts={accountsList}
        instances={instancesList}
        handleSwitchChange={handleSwitchChange}
        loading={loading}
        accountId={workspace?.accountId}
      />

      <Grid mt={3} container justifyContent="space-between">
        <Button onClick={() => navigate(`/${prefixRoute}/workspaces`)}>Cancelar</Button>
        <LoadingButton onClick={handleManageWorkspace} variant="contained" loading={loading} disabled={areFieldsEmpty}>
          {workspaceId ? "Guardar cambios" : "Crear workspace"}
        </LoadingButton>
      </Grid>
    </Paper>
  );
};

export default ManageWorkspace;
