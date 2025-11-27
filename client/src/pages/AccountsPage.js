import React from "react";
import { useNavigate } from "react-router-dom";

import PositionedButton from "../components/layout/PositionedButton";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import AccountsList from "../components/accounts/AccountsList";
import useSuperuser from "../hooks/useSuperuser";

const AccountsPage = () => {
  const { isSuperuser } = useSuperuser();
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    const prefix = isSuperuser ? "superusers" : "admins";
    navigate(`/${prefix}/accounts/create`);
  };

  return (
    <Paper className="container">
      <Box mb={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          Gestión de Cuentas (Tenants)
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Administra las cuentas de clientes o empresas. Cada cuenta representa un tenant con su propia base de datos e instancias de Superset.
        </Typography>
      </Box>

      <AccountsList />

      <PositionedButton onClick={handleCreateAccount} startIcon={<AddIcon />} variant="contained" justifyContent="flex-end">
        Crear una cuenta nueva
      </PositionedButton>
    </Paper>
  );
};

export default AccountsPage;
