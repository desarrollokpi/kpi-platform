import React from "react";
import { useNavigate } from "react-router-dom";
import { Paper, Box, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import ReportsList from "../components/reports/ReportsList";
import PositionedButton from "../components/layout/PositionedButton";
import useSuperuser from "../hooks/useSuperuser";

const ReportsPage = () => {
  const { isSuperuser } = useSuperuser();
  const navigate = useNavigate();

  const handleCreateReport = () => {
    const prefix = isSuperuser ? "superusers" : "admins";
    navigate(`/${prefix}/reports/create`);
  };

  return (
    <Paper className="container">
      <Box mb={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          Gestión de Reportes
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Los reportes agrupan dashboards relacionados de Superset. Cada reporte pertenece a un workspace.
        </Typography>
      </Box>

      <ReportsList />

      <PositionedButton onClick={handleCreateReport} startIcon={<AddIcon />} variant="contained" justifyContent="flex-end">
        Crear reporte
      </PositionedButton>
    </Paper>
  );
};

export default ReportsPage;
