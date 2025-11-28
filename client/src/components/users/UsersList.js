import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Switch, Typography, Stack, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/Key";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularLoading from "../layout/CircularLoading";
import PaginatedTable from "../common/PaginatedTable";
import { readUsers, activateUser, deactivateUser, deleteUser } from "../../state/users/usersActions";
import { useNavigate, useLocation } from "react-router-dom";
import useAdmin from "../../hooks/useAdmin";
import useSuperuser from "../../hooks/useSuperuser";

const UsersList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperuser } = useSuperuser();
  const { isAdmin } = useAdmin();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { users, loading, totalCount } = useSelector(({ users }) => users, shallowEqual);
  const { user } = useSelector(({ auth }) => auth, shallowEqual);
  const accountsId = useMemo(() => user?.accountId, [user]);
  const prefixRoute = useMemo(() => (isSuperuser ? "superusers" : "admins"), [isSuperuser]);

  const toggleActive = useCallback(
    (id, active) => {
      if (active) dispatch(activateUser(id));
      else dispatch(deactivateUser(id));
    },
    [dispatch]
  );

  const headers = [
    { label: "Nombre de Usuario", key: "username", hideOnMobile: true },
    { label: "Nombre", key: "name" },
    { label: "Correo electrónico", key: "mail" },
    { label: "Creado", key: "createdAt", type: "date", hideOnMobile: true },
    { label: "¿Está Activo?", key: "active", type: "boolean", onToggle: (item, value) => toggleActive(item.id, value) },
  ];

  const actions = [
    {
      tooltip: "Asignar dashboards",
      onClick: useCallback(
        (user) => {
          navigate(`/${prefixRoute}/users/${user.id}/assignDashboards`);
        },
        [navigate, prefixRoute]
      ),
      color: "primary",
      icon: <DashboardIcon />,
      hidden: (userItem) => !userItem.accountsId,
    },
    {
      tooltip: "Editar usuario",
      onClick: useCallback(
        (user) => {
          navigate(`/${prefixRoute}/users/update/${user.id}`);
        },
        [navigate, prefixRoute]
      ),
      color: "success",
      icon: <EditIcon />,
    },
    {
      tooltip: "Cambiar contraseña",
      onClick: useCallback(
        (user) => {
          navigate(`/${prefixRoute}/users/changePassword/${user.id}`);
        },
        [navigate, prefixRoute]
      ),
      color: "error",
      icon: <KeyIcon />,
    },
    {
      tooltip: "Eliminar usuario",
      onClick: useCallback(
        (userItem) => {
          setDeleteTarget(userItem);
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

    const filters = {
      active: activeFilter,
      limit: rowsPerPage,
      offset: page * rowsPerPage,
    };

    // Tenant admins should only see users from their account
    if (isAdmin && accountsId) {
      filters.accountId = accountsId;
    }

    dispatch(readUsers(filters));
  }, [dispatch, showOnlyActive, page, rowsPerPage, isAdmin, accountsId, location.key]);

  if (loading && users.length === 0) {
    return <CircularLoading />;
  }

  if (!loading && users.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <PeopleIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="textSecondary">
          No hay usuarios creados
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Crea el primer usuario para tu cuenta
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <PaginatedTable
        mode="server"
        headers={headers}
        data={users}
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
        <DialogTitle>Eliminar usuario</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            ¿Seguro que deseas eliminar al usuario "{deleteTarget?.username || deleteTarget?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button
            onClick={() => {
              if (deleteTarget) {
                dispatch(deleteUser(deleteTarget.id));
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

export default UsersList;
