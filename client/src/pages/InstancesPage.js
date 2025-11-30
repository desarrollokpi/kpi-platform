import React from "react";
import { Paper, Typography, Box, Grid, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

import InstancesList from "../components/instances/InstancesList";
import PositionedButton from "../components/layout/PositionedButton";
import useSuperuser from "../hooks/useSuperuser";

const InstancesPage = () => {
  const { isSuperuser } = useSuperuser();
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate(`/superusers/instances/create`);
  };

  if (!isSuperuser) {
    return (
      <Paper className="container">
        <Typography variant="h6" align="center" color="error">
          Solo el superusuario puede gestionar instancias de Superset.
        </Typography>
        <Grid container justifyContent="center" mt={3}>
          <Button onClick={() => navigate("/")}>Volver al inicio</Button>
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper className="container">
      <Box mb={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          Gestión de Instancias de Superset
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Administra las instancias de Superset disponibles para asignar a cuentas (tenants)
        </Typography>
      </Box>

      <InstancesList />

      <PositionedButton onClick={handleCreate} startIcon={<AddIcon />} variant="contained" justifyContent="flex-end">
        Crear instancia
      </PositionedButton>
    </Paper>
  );
};

export default InstancesPage;
