import React from "react";
import { Paper, Typography, Grid, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ManageInstance from "../components/instances/ManageInstance";
import useSuperuser from "../hooks/useSuperuser";

const ManageInstancePage = () => {
  const navigate = useNavigate();
  const { isSuperuser } = useSuperuser();

  if (!isSuperuser) {
    return (
      <Paper className="container">
        <Typography variant="h6" align="center" color="error">
          Solo el superusuario puede crear o editar instancias de Superset.
        </Typography>
        <Grid container justifyContent="center" mt={3}>
          <Button onClick={() => navigate("/")}>Volver al inicio</Button>
        </Grid>
      </Paper>
    );
  }

  return <ManageInstance />;
};

export default ManageInstancePage;
