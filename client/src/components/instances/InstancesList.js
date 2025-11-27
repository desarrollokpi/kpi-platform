import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Switch, Typography, Stack, Box } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import StorageIcon from "@mui/icons-material/Storage";
import CircularLoading from "../layout/CircularLoading";
import PaginatedTable from "../common/PaginatedTable";
import { getAllInstances, activateInstance, deactivateInstance } from "../../state/instances/instancesActions";
import { useNavigate } from "react-router-dom";

const InstancesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  const { instances, loading, totalCount } = useSelector((state) => state.instances, shallowEqual);

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
      getAllInstances({
        active: activeFilter,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      })
    );
  }, [dispatch, showOnlyActive, page, rowsPerPage]);

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
    </>
  );
};

export default InstancesList;
