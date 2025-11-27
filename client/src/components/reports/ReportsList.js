import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Switch, Typography, Stack, Box } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CircularLoading from "../layout/CircularLoading";
import PaginatedTable from "../common/PaginatedTable";
import { readReportsByAdmin, activateReport, deactivateReport } from "../../state/reports/reportsActions";
import { useNavigate } from "react-router-dom";

const ReportsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  const { reports, loading, totalCount } = useSelector(({ reports }) => reports, shallowEqual);

  const toggleActive = useCallback(
    (id, active) => {
      if (active) dispatch(activateReport(id));
      else dispatch(deactivateReport(id));
    },
    [dispatch]
  );

  const headers = [
    { label: "Nombre", key: "name" },
    { label: "Creado", key: "createdAt", type: "date", hideOnMobile: true },
    { label: "¿Está Activo?", key: "active", type: "boolean", onToggle: (item, value) => toggleActive(item.id, value) },
  ];

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
  ];

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  const handleSwitchChange = useCallback((event) => {
    setShowOnlyActive(event.target.checked);
  }, []);

  useEffect(() => {
    const activeFilter = showOnlyActive ? true : undefined;

    dispatch(
      readReportsByAdmin({
        active: activeFilter,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      })
    );
  }, [dispatch, showOnlyActive, page, rowsPerPage]);

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
    </>
  );
};

export default ReportsList;
