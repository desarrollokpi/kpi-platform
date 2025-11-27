import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Box, Button, Typography } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";

import AppBar from "../components/layout/AppBar";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoBack = useCallback(() => {
    // Si hay historial previo en la SPA, volvemos atrás
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Si no, vamos al home para que el router/guards decidan el destino correcto
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <>
      <AppBar />

      <Grid container justifyContent="center">
        <Grid item xs={12} md={8}>
          <Box mt={10} display="flex" flexDirection="column" alignItems="center" textAlign="center">
            <SearchOffIcon color="primary" sx={{ fontSize: 80 }} />

            <Typography mt={3} variant="h4" sx={{ fontWeight: "bold" }}>
              404
            </Typography>

            <Typography mt={1} mb={4} variant="h5">
              Página no encontrada
            </Typography>

            <Button variant="outlined" onClick={handleGoBack}>
              Ir atrás
            </Button>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default NotFoundPage;
