import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

import DashboardsList from "../components/dashboards/DashboardsList";
import PositionedButton from "../components/layout/PositionedButton";
import useSuperuser from "../hooks/useSuperuser";

const DashboardsPage = () => {
  const { isSuperuser } = useSuperuser();
  const navigate = useNavigate();

  const handleCreate = () => {
    const prefix = isSuperuser ? "superusers" : "admins";
    navigate(`/${prefix}/dashboards/create`);
  };

  return (
    <Paper className="container">
      <Box mb={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          Gestión de Dashboards
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Administra los dashboards de Superset vinculados a reportes y asignados a usuarios
        </Typography>
      </Box>

      <DashboardsList />

      <PositionedButton onClick={handleCreate} startIcon={<AddIcon />} variant="contained" justifyContent="flex-end">
        Crear dashboard
      </PositionedButton>
    </Paper>
  );
};

export default DashboardsPage;
