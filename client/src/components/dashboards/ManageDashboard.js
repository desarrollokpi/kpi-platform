import React, { useEffect, useMemo } from "react";
import { Grid, Paper, Button, Typography } from "@mui/material";
import useForm from "../../hooks/useForm";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { createDashboard, getDashboardsInstancesLists, getReportsLists, updateDashboard } from "../../state/dashboards/dashboardsActions";
import { useParams, useNavigate } from "react-router-dom";
import useNavigateAfterAction from "../../hooks/useNavigateAfterAction";
import useSuperuser from "../../hooks/useSuperuser";
import useAdmin from "../../hooks/useAdmin";
import LoadingButton from "@mui/lab/LoadingButton";
import ManageDashboardForm from "./ManageDashboardForm";
import CircularLoading from "../layout/CircularLoading";
import useAccountId from "../../hooks/useAccountId";

const COLUMNS = ["name", "reportId", "apacheId"];

const ManageDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuperuser } = useSuperuser();
  const { isAdmin } = useAdmin();

  const { dashboards, loading, reportsList, dashboardsInstancesList } = useSelector(({ dashboards }) => dashboards, shallowEqual);
  const accountId = useAccountId();
  const prefixRoute = useMemo(() => (isSuperuser ? "superusers" : "admins"), [isSuperuser]);

  const { dashboardId } = useParams();

  const thisInfo = useMemo(() => {
    if (!dashboardId) return null;
    const id = Number(dashboardId);
    if (Number.isNaN(id)) return null;
    return dashboards.find((dashboard) => dashboard.id === id) || null;
  }, [dashboardId, dashboards]);

  const buttonHasBeenClicked = useNavigateAfterAction(loading, -1);

  const formData = useMemo(
    () =>
      COLUMNS.reduce((acc, column) => {
        if (column === "apacheId") {
          acc.apacheId = thisInfo?.instanceId && thisInfo?.supersetDashboardId ? `${thisInfo.instanceId}-${thisInfo.supersetDashboardId}` : "";
          return acc;
        }

        acc[column] = thisInfo?.[column] ?? "";
        return acc;
      }, {}),
    [thisInfo]
  );

  const [dashboard, bindField, areFieldsEmpty] = useForm(formData);

  const handleManageDashboard = async () => {
    const id = dashboardId ? Number(dashboardId) : null;
    const dashboardData = {
      ...dashboard,
    };

    const action = await dispatch(id ? updateDashboard(id, dashboardData) : createDashboard(dashboardData));
    if (action) {
      buttonHasBeenClicked();
    }
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

  if (loading && dashboardId && !thisInfo) {
    return (
      <Paper className="container">
        <CircularLoading />
      </Paper>
    );
  }

  if (dashboardId && !thisInfo && !loading) {
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
          {dashboardId ? "Guardar cambios" : "Vincular dashboard"}
        </LoadingButton>
      </Grid>
    </Paper>
  );
};

export default ManageDashboard;
