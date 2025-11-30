import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Switch, Typography, Stack, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CircularLoading from "../layout/CircularLoading";
import PaginatedTable from "../common/PaginatedTable";
import { readReportsByAdmin, activateReport, deactivateReport, deleteReport } from "../../state/reports/reportsActions";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSuperuser from "../../hooks/useSuperuser";
import useAdmin from "../../hooks/useAdmin";

const ReportsList = () => {
  const { isSuperuser } = useSuperuser();
  const { isAdmin } = useAdmin();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get("page");
    const parsed = pageParam ? parseInt(pageParam, 10) : 1;
    return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
  });
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const rppParam = searchParams.get("rowsPerPage");
    const parsed = rppParam ? parseInt(rppParam, 10) : 10;
    return Number.isNaN(parsed) ? 10 : parsed;
  });
  const [showOnlyActive, setShowOnlyActive] = useState(() => searchParams.get("active") === "true");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { reports, loading, totalCount } = useSelector(({ reports }) => reports, shallowEqual);
  const { user } = useSelector(({ auth }) => auth, shallowEqual);

  const toggleActive = useCallback(
    (id, active) => {
      if (active) dispatch(activateReport(id));
      else dispatch(deactivateReport(id));
    },
    [dispatch]
  );

  const headers = useMemo(() => {
    const baseHeaders = [
      { label: "Nombre", key: "name" },
      { label: "Creado", key: "createdAt", type: "date", hideOnMobile: true },
      { label: "¿Está Activo?", key: "active", type: "boolean", onToggle: (item, value) => toggleActive(item.id, value) },
    ];

    // For root admin and tenant admin, show workspace name for extra context
    if (isSuperuser || isAdmin) {
      baseHeaders.splice(1, 0, { label: "Workspace", key: "workspaceName", hideOnMobile: true });
    }

    return baseHeaders;
  }, [isSuperuser, isAdmin, toggleActive]);

  const actions = [
    {
      tooltip: "Editar",
      onClick: useCallback(
        (report) => {
          navigate(`/superusers/reports/update/${report.id}`);
        },
        [navigate]
      ),
      color: "success",
      icon: <EditIcon />,
    },
    {
      tooltip: "Eliminar",
      onClick: useCallback(
        (report) => {
          setDeleteTarget(report);
        },
        []
      ),
      color: "error",
      icon: <DeleteIcon />,
    },
  ];

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  }, []);

  const handleSwitchChange = useCallback((event) => {
    setShowOnlyActive(event.target.checked);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("rowsPerPage", String(rowsPerPage));
    if (showOnlyActive) {
      params.set("active", "true");
    }
    setSearchParams(params, { replace: true });
  }, [page, rowsPerPage, showOnlyActive, setSearchParams]);

  useEffect(() => {
    const activeFilter = showOnlyActive ? true : undefined;

    const filters = {
      active: activeFilter,
      limit: rowsPerPage,
      offset: (page - 1) * rowsPerPage,
    };

    // Tenant admins should be filtered by their account; root admin sees all reports
    if (!isSuperuser && user?.accountId) {
      filters.accountId = user.accountId;
    }

    dispatch(readReportsByAdmin(filters));
  }, [dispatch, showOnlyActive, page, rowsPerPage, user, isSuperuser]);

  if (loading && reports.length === 0) {
    return <CircularLoading />;
  }

  if (!loading && reports.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <AssessmentIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="textSecondary">
          No hay reportes creados
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Crea el primer reporte para agrupar dashboards relacionados
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <PaginatedTable
        mode="server"
        headers={headers}
        data={reports}
        size="small"
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        showPagination
        actions={actions}
      />

      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 2 }}>
        <Typography>Todos</Typography>
        <Switch
          inputProps={{
            "aria-label": showOnlyActive ? "Todos" : "Solo activos",
          }}
          checked={showOnlyActive}
          onChange={handleSwitchChange}
        />
        <Typography>Solo activos</Typography>
      </Stack>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Eliminar reporte</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            ¿Seguro que deseas eliminar el reporte "{deleteTarget?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button
            onClick={() => {
              if (deleteTarget) {
                dispatch(deleteReport(deleteTarget.id));
              }
              setDeleteTarget(null);
            }}
            color="error"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReportsList;
