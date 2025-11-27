import React from "react";
import UsersList from "../components/users/UsersList";
import { useNavigate } from "react-router-dom";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import PositionedButton from "../components/layout/PositionedButton";
import useSuperuser from "../hooks/useSuperuser";

const UsersPage = () => {
  const { isSuperuser } = useSuperuser();
  const navigate = useNavigate();

  const handleCreate = () => {
    const prefix = isSuperuser ? "superusers" : "admins";
    navigate(`/${prefix}/users/create`);
  };

  return (
    <Paper className="container">
      <Box mb={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          Gestión de Usuarios
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Administra los usuarios de tu cuenta (tenant)
        </Typography>
      </Box>

      <UsersList />

      <PositionedButton onClick={() => handleCreate()} startIcon={<AddIcon />} variant="contained" justifyContent="flex-end">
        Agregar nuevo usuario
      </PositionedButton>
    </Paper>
  );
};

export default UsersPage;
