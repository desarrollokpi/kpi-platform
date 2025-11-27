import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Switch, Typography, Stack, Box } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/Key";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import CircularLoading from "../layout/CircularLoading";
import PaginatedTable from "../common/PaginatedTable";
import { readUsers, activateUser, deactivateUser } from "../../state/users/usersActions";
import { useNavigate } from "react-router-dom";
import useAdmin from "../../hooks/useAdmin";
import useSuperuser from "../../hooks/useSuperuser";

const UsersList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuperuser } = useSuperuser();
  const { isAdmin } = useAdmin();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  const { users, loading, totalCount } = useSelector(({ users }) => users, shallowEqual);
  const { user } = useSelector(({ auth }) => auth, shallowEqual);
  const accountsId = useMemo(() => user?.accountId, [user]);
  const prefixRoute = useMemo(() => (isSuperuser ? "superusers" : "${prefixRoute}"), [isSuperuser]);

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
        [navigate]
      ),
      color: "primary",
      icon: <DashboardIcon />,
    },
    {
      tooltip: "Editar usuario",
      onClick: useCallback(
        (user) => {
          navigate(`/${prefixRoute}/users/update/${user.id}`);
        },
        [navigate]
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
        [navigate]
      ),
      color: "error",
      icon: <KeyIcon />,
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

    // Tenant ${prefixRoute} should only see users from their account
    if (isAdmin && accountsId) {
      filters.accountId = accountsId;
    }

    dispatch(readUsers(filters));
  }, [dispatch, showOnlyActive, page, rowsPerPage, isAdmin, accountsId]);

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
    </>
  );
};

export default UsersList;
