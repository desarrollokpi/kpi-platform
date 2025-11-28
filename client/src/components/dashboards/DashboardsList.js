import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Switch, Typography, Stack, Box } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import PreviewIcon from "@mui/icons-material/Preview";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CircularLoading from "../layout/CircularLoading";
import PaginatedTable from "../common/PaginatedTable";
import { getAllDashboards, activateDashboard, deactivateDashboard } from "../../state/dashboards/dashboardsActions";
import { useNavigate } from "react-router-dom";
import useSuperuser from "../../hooks/useSuperuser";
import useAdmin from "../../hooks/useAdmin";

const DashboardsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuperuser } = useSuperuser();
  const { isAdmin } = useAdmin();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const { dashboards, loading, totalCount } = useSelector(({ dashboards }) => dashboards, shallowEqual);
  const prefixRoute = useMemo(() => {
    if (isSuperuser) {
      return "superusers";
    }
    if (isAdmin) {
      return "admins";
    }
    return "users";
  }, [isSuperuser, isAdmin]);

  const toggleActive = useCallback(
    (id, active) => {
      if (active) dispatch(activateDashboard(id));
      else dispatch(deactivateDashboard(id));
    },
    [dispatch]
  );

  const headers = [
    { label: "Nombre", key: "name" },
    { label: "Creado", key: "createdAt", type: "date", hideOnMobile: true },
    { label: "¿Está Activo?", key: "active", type: "boolean", onToggle: (item, value) => toggleActive(item.id, value) },
  ];

  const actions =
    isAdmin || isSuperuser
      ? [
          {
            tooltip: "Editar",
            onClick: (dashboard) => {
              navigate(`/superusers/dashboards/update/${dashboard.id}`);
            },
            color: "success",
            icon: <EditIcon />,
          },
          {
            tooltip: "Ver",
            onClick: (dashboard) => {
              navigate(`/${prefixRoute}/showDashboard/${dashboard.id}`);
            },
            color: "info",
            icon: <PreviewIcon />,
          },
        ]
      : [
          {
            tooltip: "Ver",
            onClick: (dashboard) => {
              navigate(`/${prefixRoute}/showDashboard/${dashboard.id}`);
            },
            color: "info",
            icon: <PreviewIcon />,
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
      getAllDashboards({
        active: activeFilter,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      })
    );
  }, [dispatch, showOnlyActive, page, rowsPerPage]);

  if (loading && dashboards.length === 0) {
    return <CircularLoading />;
  }

  if (!loading && dashboards.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <DashboardIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="textSecondary">
          No hay dashboards configurados
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Vincula el primer dashboard desde Apache Superset
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <PaginatedTable
        mode="server"
        headers={headers}
        data={dashboards}
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

export default DashboardsList;
