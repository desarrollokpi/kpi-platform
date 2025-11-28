import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Switch, Typography, Stack, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import PreviewIcon from "@mui/icons-material/Preview";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularLoading from "../layout/CircularLoading";
import PaginatedTable from "../common/PaginatedTable";
import { getAllDashboards, activateDashboard, deactivateDashboard, deleteDashboard } from "../../state/dashboards/dashboardsActions";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSuperuser from "../../hooks/useSuperuser";
import useAdmin from "../../hooks/useAdmin";

const DashboardsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isSuperuser } = useSuperuser();
  const { isAdmin } = useAdmin();

  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get("page");
    const parsed = pageParam ? parseInt(pageParam, 10) : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
  });
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const rppParam = searchParams.get("rowsPerPage");
    const parsed = rppParam ? parseInt(rppParam, 10) : 10;
    return Number.isNaN(parsed) ? 10 : parsed;
  });
  const [showOnlyActive, setShowOnlyActive] = useState(() => searchParams.get("active") === "true");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { dashboards, loading, totalCount } = useSelector(({ dashboards }) => dashboards, shallowEqual);
  const { user } = useSelector(({ auth }) => auth, shallowEqual);

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

  const headers = useMemo(() => {
    const userHeaders = [
      { label: "Nombre", key: "name" },
      // For root admin and tenant admin show associated report name
      ...(isSuperuser || isAdmin ? [{ label: "Reporte", key: "reportName", hideOnMobile: true }] : []),
      { label: "Creado", key: "createdAt", type: "date", hideOnMobile: true },
    ];

    if (isAdmin || isSuperuser) {
      userHeaders.push({ label: "¿Está Activo?", key: "active", type: "boolean", onToggle: (item, value) => toggleActive(item.id, value) });
    }

    return userHeaders;
  }, [isAdmin, isSuperuser, toggleActive]);

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
          {
            tooltip: "Eliminar",
            onClick: (dashboard) => {
              setDeleteTarget(dashboard);
            },
            color: "error",
            icon: <DeleteIcon />,
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
      offset: page * rowsPerPage,
    };

    // For regular users we rely on backend permission checks (no explicit accountId filter).
    // Tenant admins list dashboards for their tenant using accountId.
    // Root admins (superusers) should see all dashboards across tenants, so we ignore accountId for them.
    if (user?.accountId && isAdmin && !isSuperuser) {
      filters.accountId = user.accountId;
    }

    dispatch(getAllDashboards(filters));
  }, [dispatch, showOnlyActive, page, rowsPerPage, user, isSuperuser, isAdmin]);

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

      {(isSuperuser || isAdmin) && (
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
      )}

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Eliminar dashboard</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            ¿Seguro que deseas eliminar el dashboard "{deleteTarget?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button
            onClick={() => {
              if (deleteTarget) {
                dispatch(deleteDashboard(deleteTarget.id));
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

export default DashboardsList;
