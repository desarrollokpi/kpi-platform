import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Paper, Typography, Box, Grid, Card, CardContent, CardActions, Button, CircularProgress } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { getUserDashboards } from "../state/usersDashboards/usersDashboardsActions";
import useSuperuser from "../hooks/useSuperuser";

const ListDashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { userDashboards, loading } = useSelector((state) => state.usersDashboards);
  const { isSuperuser } = useSuperuser();

  useEffect(() => {
    if (user?.id) {
      dispatch(getUserDashboards(user.id));
    }
  }, [dispatch, user]);

  const handleViewDashboard = (dashboardId) => {
    // Determine route prefix based on user role
    const prefix = isSuperuser ? "/superusers" : "/admins";
    navigate(`${prefix}/showDashboard/${dashboardId}`);
  };

  if (loading) {
    return (
      <Paper className="container">
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (!loading && userDashboards.length === 0) {
    return (
      <Paper className="container">
        <Box textAlign="center" p={4}>
          <DashboardIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            {isSuperuser
              ? "No hay dashboards creados en el sistema"
              : "No tienes dashboards asignados"}
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            {isSuperuser
              ? "Crea dashboards desde la sección de gestión de dashboards"
              : "Contacta a tu administrador para que te asigne dashboards"}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper className="container">
      <Box mb={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          Mis Dashboards
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Dashboards asignados a tu usuario
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {userDashboards.map((dashboard) => (
          <Grid item xs={12} sm={6} md={4} key={dashboard.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-4px)",
                  transition: "all 0.3s ease-in-out",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <DashboardIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    {dashboard.name}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    minHeight: "60px",
                  }}
                >
                  {dashboard.description || "Sin descripción disponible"}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
                <Button size="small" variant="contained" startIcon={<VisibilityIcon />} onClick={() => handleViewDashboard(dashboard.id)}>
                  Ver Dashboard
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default ListDashboardPage;
