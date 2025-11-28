import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Switch, Typography, Stack, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";
import CircularLoading from "../layout/CircularLoading";
import PaginatedTable from "../common/PaginatedTable";
import { getAllWorkspaces, activateWorkspace, deactivateWorkspace, deleteWorkspace } from "../../state/workspaces/workspacesActions";
import { useNavigate, useLocation } from "react-router-dom";

const WorkspacesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { workspaces, loading, totalCount } = useSelector(({ workspaces }) => workspaces, shallowEqual);
  const { user } = useSelector(({ auth }) => auth, shallowEqual);

  const toggleActive = useCallback(
    (id, active) => {
      if (active) dispatch(activateWorkspace(id));
      else dispatch(deactivateWorkspace(id));
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
        (workspace) => {
          navigate(`/superusers/workspaces/update/${workspace.id}`);
        },
        [navigate]
      ),
      color: "success",
      icon: <EditIcon />,
    },
    {
      tooltip: "Eliminar",
      onClick: useCallback(
        (workspace) => {
          setDeleteTarget(workspace);
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
    const activeFilter = showOnlyActive ? true : undefined;

    dispatch(
      getAllWorkspaces({
        active: activeFilter,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        accountId: user?.accountId || null,
      })
    );
  }, [dispatch, showOnlyActive, page, rowsPerPage, location.key, user]);

  if (loading && workspaces.length === 0) {
    return <CircularLoading />;
  }

  if (!loading && workspaces.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <FolderIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="textSecondary">
          No hay workspaces sincronizados
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Sincroniza workspaces desde una instancia de Superset
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <PaginatedTable
        mode="server"
        headers={headers}
        data={workspaces}
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
        <DialogTitle>Eliminar workspace</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            ¿Seguro que deseas eliminar el workspace "{deleteTarget?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button
            onClick={() => {
              if (deleteTarget) {
                dispatch(deleteWorkspace(deleteTarget.id));
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

export default WorkspacesList;
