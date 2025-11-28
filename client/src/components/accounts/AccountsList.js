import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Switch, Typography, Stack, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularLoading from "@layout/CircularLoading";
import PaginatedTable from "../common/PaginatedTable";
import { getAccountsLists, activateAccount, deActivateAccount, deleteAccount } from "../../state/accounts/accountsActions";
import { useNavigate, useLocation } from "react-router-dom";

const AccountsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { accounts, loading, totalCount } = useSelector((state) => state.accounts, shallowEqual);

  const toggleActive = useCallback(
    (id, active) => {
      if (active) dispatch(activateAccount(id));
      else dispatch(deActivateAccount(id));
    },
    [dispatch]
  );

  const headers = [
    { label: "Nombre", key: "name" },
    { label: "Sub Dominio", key: "subDomain", hideOnMobile: true },
    { label: "Nombre de Base de datos", key: "dataBase", hideOnMobile: true },
    { label: "Creado", key: "createdAt", type: "date", hideOnMobile: true },
    { label: "¿Esta Activa?", key: "active", type: "boolean", onToggle: (item, value) => toggleActive(item.id, value) },
  ];

  const actions = [
    {
      tooltip: "Editar",
      onClick: useCallback(
        (account) => {
          navigate(`/superusers/accounts/update/${account.id}`);
        },
        [navigate]
      ),
      color: "success",
      icon: <EditIcon />,
    },
    {
      tooltip: "Eliminar",
      onClick: useCallback(
        (account) => {
          setDeleteTarget(account);
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
      getAccountsLists({
        active: activeFilter,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      })
    );
  }, [dispatch, showOnlyActive, page, rowsPerPage, location.key]);

  if (loading && accounts.length === 0) {
    return <CircularLoading />;
  }

  if (!loading && accounts.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <AccountBalanceIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="textSecondary">
          No hay cuentas (tenants) creadas
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Crea la primera cuenta para comenzar a administrar tenants
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <PaginatedTable
        mode="server"
        headers={headers}
        data={accounts}
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
        <DialogTitle>Eliminar cuenta</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            ¿Seguro que deseas eliminar la cuenta "{deleteTarget?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button
            onClick={() => {
              if (deleteTarget) {
                dispatch(deleteAccount(deleteTarget.id));
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

export default AccountsList;
