import React, { useEffect, useMemo } from "react";
import { Grid, Paper, Button, Typography } from "@mui/material";
import useForm from "../../hooks/useForm";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { createReport, updateReport, getWorkspacesListForReports } from "../../state/reports/reportsActions";
import { useParams, useNavigate } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import ManageReportForm from "./ManageReportForm";
import CircularLoading from "../layout/CircularLoading";
import useNavigateAfterAction from "../../hooks/useNavigateAfterAction";
import useSuperuser from "../../hooks/useSuperuser";
import useAdmin from "../../hooks/useAdmin";
import useAccountId from "../../hooks/useAccountId";

const COLUMNS = ["name", "workspaceId"];

const ManageReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuperuser } = useSuperuser();
  const { isAdmin } = useAdmin();
  const { reportId } = useParams();

  const { reports, workspacesList, loading } = useSelector(({ reports }) => reports, shallowEqual);
  const accountId = useAccountId();
  const prefixRoute = useMemo(() => (isSuperuser ? "superusers" : "admins"), [isSuperuser]);

  const thisInfo = useMemo(() => {
    if (!reportId) return null;
    const id = Number(reportId);
    if (Number.isNaN(id)) return null;
    return reports.find((report) => report.id === id) || null;
  }, [reportId, reports]);

  const buttonHasBeenClicked = useNavigateAfterAction(loading, `/${prefixRoute}/reports`);

  const formData = useMemo(
    () =>
      COLUMNS.reduce((acc, column) => {
        acc[column] = thisInfo?.[column] ?? "";
        return acc;
      }, {}),
    [thisInfo]
  );

  const [report, bindField, areFieldsEmpty] = useForm(formData);

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

  const handleManageReport = async () => {
    const id = reportId ? Number(reportId) : null;
    const reportData = {
      ...report,
    };

    const action = await dispatch(id ? updateReport(id, reportData) : createReport(reportData));
    if (action) {
      buttonHasBeenClicked();
    }
  };

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

  if (loading && reportId && !thisInfo) {
    return (
      <Paper className="container">
        <CircularLoading />
      </Paper>
    );
  }

  if (reportId && !thisInfo && !loading) {
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
      <ManageReportForm reportId={reportId} bindField={bindField} isSuperuser={isSuperuser} isAdmin={isAdmin} workspaces={workspacesList} loading={loading} />

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
