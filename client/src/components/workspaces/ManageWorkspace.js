import React, { useEffect, useMemo } from "react";
import { Grid, Paper, Button, Typography } from "@mui/material";
import useForm from "../../hooks/useForm";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { createWorkspace, getInstancesLists, updateWorkspace, getAccountsLists } from "../../state/workspaces/workspacesActions";
import { useParams, useNavigate } from "react-router-dom";
import useNavigateAfterAction from "../../hooks/useNavigateAfterAction";
import useSuperuser from "../../hooks/useSuperuser";
import useAccountId from "../../hooks/useAccountId";
import LoadingButton from "@mui/lab/LoadingButton";
import ManageWorkspaceForm from "./ManageWorkspaceForm";
import CircularLoading from "../layout/CircularLoading";

const COLUMNS = ["name", "accountId", "instanceId"];

const ManageWorkspace = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuperuser } = useSuperuser();
  const { workspaceId } = useParams();

  const { workspaces, accountsList, instancesList, loading } = useSelector(({ workspaces }) => workspaces, shallowEqual);
  const accountId = useAccountId();
  const prefixRoute = useMemo(() => (isSuperuser ? "superusers" : "admins"), [isSuperuser]);

  const thisInfo = useMemo(() => {
    if (!workspaceId) return null;
    const id = Number(workspaceId);
    if (Number.isNaN(id)) return null;
    return workspaces.find((workspace) => workspace.id === id) || null;
  }, [workspaceId, workspaces]);

  const buttonHasBeenClicked = useNavigateAfterAction(loading, `/${prefixRoute}/workspaces`);

  const formData = useMemo(
    () =>
      COLUMNS.reduce((acc, column) => {
        if (column === "accountId") {
          acc.accountId = thisInfo?.accountId ?? accountId ?? "";
          return acc;
        }
        acc[column] = thisInfo?.[column] ?? "";
        return acc;
      }, {}),
    [thisInfo, accountId]
  );

  const [workspace, bindField, areFieldsEmpty] = useForm(formData);

  useEffect(() => {
    if (isSuperuser) {
      dispatch(getAccountsLists());
    }
  }, [dispatch, isSuperuser]);

  useEffect(() => {
    if (workspace?.accountId) {
      dispatch(getInstancesLists(workspace.accountId));
    }
  }, [dispatch, workspace?.accountId]);

  const handleManageWorkspace = async () => {
    const id = workspaceId ? Number(workspaceId) : null;
    const workspaceData = {
      ...workspace,
    };

    const action = await dispatch(id ? updateWorkspace(id, workspaceData) : createWorkspace(workspaceData));
    if (action) {
      buttonHasBeenClicked();
    }
  };

  // // Solo los superusers pueden gestionar workspaces
  // if (!isSuperuser) {
  //   return (
  //     <Paper className="container">
  //       <Typography variant="h6" align="center" color="error">
  //         No tienes permisos para acceder a esta página
  //       </Typography>
  //       <Grid container justifyContent="center" mt={3}>
  //         <Button onClick={() => navigate("/")}>Volver al inicio</Button>
  //       </Grid>
  //     </Paper>
  //   );
  // }

  if (loading && workspaceId && !thisInfo) {
    return (
      <Paper className="container">
        <CircularLoading />
      </Paper>
    );
  }

  if (workspaceId && !thisInfo && !loading) {
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
        isSuperuser={isSuperuser}
        accounts={accountsList}
        instances={instancesList}
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
