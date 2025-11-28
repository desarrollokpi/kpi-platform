import React, { useEffect, useMemo } from "react";
import { Grid, Paper, Button, Typography } from "@mui/material";
import useForm from "../../hooks/useForm";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { createDashboard, getDashboardsInstancesLists, getReportsLists, updateDashboard } from "../../state/dashboards/dashboardsActions";
import { useParams, useNavigate } from "react-router-dom";
import useToggle from "../../hooks/useToggle";
import useNavigateAfterAction from "../../hooks/useNavigateAfterAction";
import useSuperuser from "../../hooks/useSuperuser";
import useAdmin from "../../hooks/useAdmin";
import LoadingButton from "@mui/lab/LoadingButton";
import ManageDashboardForm from "./ManageDashboardForm";
import CircularLoading from "../layout/CircularLoading";

const ManageDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuperuser } = useSuperuser();
  const { isAdmin } = useAdmin();

  const { dashboards, loading, reportsList, dashboardsInstancesList } = useSelector(({ dashboards }) => dashboards, shallowEqual);
  const { user } = useSelector(({ auth }) => auth, shallowEqual);
  const accountId = useMemo(() => user?.accountId || null, [user]);
  const prefixRoute = useMemo(() => (isSuperuser ? "superusers" : "admins"), [isSuperuser]);

  const initialState = {
    name: "",
    reportId: "",
    apacheId: "",
  };

  let thisDashboard = undefined;

  const { dashboardId } = useParams();

  if (dashboardId) {
    thisDashboard = dashboards.find((dashboard) => dashboard.id === parseInt(dashboardId, 10));
  }

  const buttonHasBeenClicked = useNavigateAfterAction(loading, -1);

  const initialFormState = dashboardId && thisDashboard
    ? {
        ...thisDashboard,
        // Rebuild apacheId from stored supersetId and supersetDashboardId for edit mode
        apacheId:
          thisDashboard.supersetId && thisDashboard.supersetDashboardId
            ? `${thisDashboard.supersetId}-${thisDashboard.supersetDashboardId}`
            : "",
      }
    : initialState;

  const [dashboard, bindField, areFieldsEmpty] = useForm(initialFormState);

  const [active, handleSwitchChange] = useToggle(dashboardId ? thisDashboard?.active : true);

  const handleManageDashboard = () => {
    const dashboardData = { ...dashboard, active };

    dispatch(dashboardId ? updateDashboard(dashboardData) : createDashboard(dashboardData));

    buttonHasBeenClicked();
  };

  // Cargar reports filtrados por account si es admin
  useEffect(() => {
    const reportFilters = {};
    if (isAdmin && accountId) {
      reportFilters.accountId = accountId;
    }
    dispatch(getReportsLists(reportFilters));
  }, [dispatch, isAdmin, accountId]);

  useEffect(() => {
    if (dashboard?.reportId && dashboard?.reportId !== "") {
      dispatch(getDashboardsInstancesLists(dashboard));
    }
  }, [dashboard, dispatch]);

  if (loading && dashboardId && !thisDashboard) {
    return (
      <Paper className="container">
        <CircularLoading />
      </Paper>
    );
  }

  if (dashboardId && !thisDashboard && !loading) {
    return (
      <Paper className="container">
        <Typography variant="h6" align="center" color="error">
          Dashboard no encontrado
        </Typography>
        <Grid container justifyContent="center" mt={3}>
          <Button onClick={() => navigate(`/${prefixRoute}/dashboards`)}>Volver a la lista</Button>
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper className="container">
      <ManageDashboardForm
        dashboardId={dashboardId}
        bindField={bindField}
        active={active}
        handleSwitchChange={handleSwitchChange}
        reports={reportsList}
        dashboards={dashboardsInstancesList}
        loadingReports={loading}
        isSuperuser={isSuperuser}
        isAdmin={isAdmin}
        reportId={dashboard?.reportId}
      />

      <Grid mt={3} container justifyContent="space-between">
        <Button onClick={() => navigate(-1)}>Cancelar</Button>
        <LoadingButton onClick={handleManageDashboard} variant="contained" loading={loading} disabled={areFieldsEmpty}>
          {dashboardId ? "Guardar cambios" : "Crear dashboard"}
        </LoadingButton>
      </Grid>
    </Paper>
  );
};

export default ManageDashboard;
