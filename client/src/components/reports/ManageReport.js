import React, { useEffect, useMemo } from "react";
import { Grid, Paper, Button, Typography } from "@mui/material";
import useForm from "../../hooks/useForm";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { createReport, updateReport, getWorkspacesListForReports } from "../../state/reports/reportsActions";
import { useParams, useNavigate } from "react-router-dom";
import useToggle from "../../hooks/useToggle";
import useNavigateAfterAction from "../../hooks/useNavigateAfterAction";
import useSuperuser from "../../hooks/useSuperuser";
import useAdmin from "../../hooks/useAdmin";
import LoadingButton from "@mui/lab/LoadingButton";
import ManageReportForm from "./ManageReportForm";
import CircularLoading from "../layout/CircularLoading";

const ManageReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuperuser } = useSuperuser();
  const { isAdmin } = useAdmin();
  const { reportId } = useParams();

  const { reports, workspacesList, loading } = useSelector(({ reports }) => reports, shallowEqual);
  const { user } = useSelector(({ auth }) => auth, shallowEqual);
  const accountId = useMemo(() => user?.accountId || null, [user]);
  const prefixRoute = useMemo(() => (isSuperuser ? "superusers" : "admins"), [isSuperuser]);

  const initialState = {
    name: "",
    workspacesId: "",
  };

  let thisReport = undefined;

  if (reportId) {
    thisReport = reports.find((report) => report.id === parseInt(reportId));
  }

  const buttonHasBeenClicked = useNavigateAfterAction(loading, `/${prefixRoute}/reports`);

  const [report, bindField, areFieldsEmpty] = useForm(reportId ? thisReport : initialState);

  const [active, handleSwitchChange] = useToggle(reportId ? thisReport?.active : true);

  useEffect(() => {
    // Load workspaces list based on user role
    const filters = { active: true };

    // For tenant admin, filter by their accountId
    if (isAdmin && !isSuperuser && accountId) {
      filters.accountId = accountId;
    }
    // For superuser, get all active workspaces (no accountId filter)

    dispatch(getWorkspacesListForReports(filters));
  }, [dispatch, isAdmin, isSuperuser, accountId]);

  // Only superusers and admins can manage reports
  if (!isSuperuser && !isAdmin) {
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

  const handleManageReport = () => {
    const reportData = { ...report, active };

    dispatch(reportId ? updateReport(reportData) : createReport(reportData));

    buttonHasBeenClicked();
  };

  if (loading && reportId && !thisReport) {
    return (
      <Paper className="container">
        <CircularLoading />
      </Paper>
    );
  }

  if (reportId && !thisReport && !loading) {
    return (
      <Paper className="container">
        <Typography variant="h6" align="center" color="error">
          Reporte no encontrado
        </Typography>
        <Grid container justifyContent="center" mt={3}>
          <Button onClick={() => navigate(`/${prefixRoute}/reports`)}>Volver a la lista</Button>
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper className="container">
      <ManageReportForm
        reportId={reportId}
        bindField={bindField}
        active={active}
        isSuperuser={isSuperuser}
        isAdmin={isAdmin}
        workspaces={workspacesList}
        handleSwitchChange={handleSwitchChange}
        loading={loading}
      />

      <Grid mt={3} container justifyContent="space-between">
        <Button onClick={() => navigate(`/${prefixRoute}/reports`)}>Cancelar</Button>
        <LoadingButton onClick={handleManageReport} variant="contained" loading={loading} disabled={areFieldsEmpty}>
          {reportId ? "Guardar cambios" : "Crear reporte"}
        </LoadingButton>
      </Grid>
    </Paper>
  );
};

export default ManageReport;
