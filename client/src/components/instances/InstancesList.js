import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Switch, Typography, Stack, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StorageIcon from "@mui/icons-material/Storage";
import CircularLoading from "../layout/CircularLoading";
import PaginatedTable from "../common/PaginatedTable";
import { getAllInstances, activateInstance, deactivateInstance, deleteInstance } from "../../state/instances/instancesActions";
import { useNavigate, useSearchParams } from "react-router-dom";

const InstancesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const { instances, loading, totalCount } = useSelector(({ instances }) => instances, shallowEqual);
  const { user } = useSelector(({ auth }) => auth, shallowEqual);

  const toggleActive = useCallback(
    (id, active) => {
      if (active) dispatch(activateInstance(id));
      else dispatch(deactivateInstance(id));
    },
    [dispatch]
  );

  const headers = [
    { label: "Nombre", key: "name" },
    { label: "Url Instancia", key: "baseUrl" },
    { label: "Nombre de usuario de la instancia", key: "apiUserName", hideOnMobile: true },
    { label: "Creado", key: "createdAt", type: "date", hideOnMobile: true },
    { label: "¿Está Activo?", key: "active", type: "boolean", onToggle: (item, value) => toggleActive(item.id, value) },
  ];

  const actions = [
    {
      tooltip: "Editar",
      onClick: useCallback(
        (instance) => {
          navigate(`/superusers/instances/update/${instance.id}`);
        },
        [navigate]
      ),
      color: "success",
      icon: <EditIcon />,
    },
    {
      tooltip: "Eliminar",
      onClick: useCallback(
        (instance) => {
          setDeleteTarget(instance);
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

    dispatch(
      getAllInstances({
        active: activeFilter,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        accountId: user?.accountId || null,
      })
    );
  }, [dispatch, showOnlyActive, page, rowsPerPage, user]);

  if (loading && instances.length === 0) {
    return <CircularLoading />;
  }

  if (!loading && instances.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <StorageIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="textSecondary">
          No hay instancias de Superset configuradas
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Crea la primera instancia para comenzar a sincronizar workspaces y dashboards
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <PaginatedTable
        mode="server"
        headers={headers}
        data={instances}
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
        <Typography>Solo activas</Typography>
      </Stack>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Eliminar instancia</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            ¿Seguro que deseas eliminar la instancia "{deleteTarget?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button
            onClick={() => {
              if (deleteTarget) {
                dispatch(deleteInstance(deleteTarget.id));
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

export default InstancesList;
