import React, { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Paper, Box, Typography, Tooltip, CircularProgress, Snackbar, Alert, Button } from "@mui/material";
import { Download as DownloadIcon, Email as EmailIcon } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import { getDashboardEmbeddedConfig, exportDashboardCsv, sendDashboardEmail } from "../state/dashboards/dashboardsActions";
import { GET_DASHBOARD_EMBEDDED_CONFIG } from "../state/dashboards/dashboardsTypes";
import useSuperuser from "../hooks/useSuperuser";
import useAdmin from "../hooks/useAdmin";

const ShowDashboardPage = () => {
  const dispatch = useDispatch();
  const { dashboardId } = useParams();
  const navigate = useNavigate();
  const supersetContainer = useRef(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const { loading, embeddedConfig } = useSelector((state) => state.dashboards);
  const { isSuperuser } = useSuperuser();
  const { isAdmin } = useAdmin();

  const prefixRoute = useMemo(() => {
    if (isSuperuser) {
      return "superusers";
    }
    if (isAdmin) {
      return "admins";
    }
    return "users";
  }, [isSuperuser, isAdmin]);

  useEffect(() => {
    if (dashboardId) {
      dispatch(getDashboardEmbeddedConfig(dashboardId)).catch(() => {
        dispatch({ type: GET_DASHBOARD_EMBEDDED_CONFIG, payload: null });
        setSnackbar({
          open: true,
          message: "Error al cargar configuración del dashboard",
          severity: "error",
        });
      });
    }
    return () => {
      dispatch({ type: GET_DASHBOARD_EMBEDDED_CONFIG, payload: null });
    };
  }, [dispatch, dashboardId]);

  const generateEmbedded = useCallback(
    async (embedData) => {
      if (!embedData || !supersetContainer.current) return;

      try {
        await embedDashboard({
          id: embedData.dashboardId,
          supersetDomain: embedData.supersetDomain,
          mountPoint: supersetContainer.current,
          fetchGuestToken: () => embedData.token,
          dashboardUiConfig: {
            hideTitle: !isSuperuser && !isAdmin,
            hideTab: !isSuperuser && !isAdmin,
            hideChartControls: !isSuperuser && !isAdmin,
            filters: {
              visible: !isSuperuser && !isAdmin,
            },
          },
        });

        const iframe = supersetContainer.current.querySelector("iframe");

        if (iframe) {
          iframe.style.width = "100%";
          iframe.style.height = "85vh";
          iframe.style.border = "none";
        }
      } catch (error) {
        console.error("Error embedding dashboard:", error);
      }
    },
    [supersetContainer, isSuperuser, isAdmin]
  );

  useEffect(() => {
    if (embeddedConfig) {
      generateEmbedded(embeddedConfig);
    }
  }, [embeddedConfig, generateEmbedded]);

  const handleExportCsv = async () => {
    if (dashboardId) {
      try {
        await dispatch(exportDashboardCsv(dashboardId));
        setSnackbar({ open: true, message: "CSV descargado exitosamente", severity: "success" });
      } catch (error) {
        setSnackbar({ open: true, message: "Error al descargar CSV", severity: "error" });
      }
    }
  };

  const handleSendEmail = async () => {
    if (dashboardId) {
      if (window.confirm("¿Enviar este dashboard por email?")) {
        try {
          await dispatch(sendDashboardEmail(dashboardId));
          setSnackbar({ open: true, message: "Email enviado exitosamente", severity: "success" });
        } catch (error) {
          setSnackbar({ open: true, message: "Error al enviar email", severity: "error" });
        }
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const isInitialLoading = loading && !embeddedConfig;

  if (isInitialLoading) {
    return (
      <Paper className="container">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper className="container">
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" columnGap={2}>
          <Button onClick={() => navigate(`/${prefixRoute}/dashboards`)}>Volver</Button>
          <Typography variant="h6">{embeddedConfig?.dashboardName || "Dashboard"}</Typography>
        </Box>
        {embeddedConfig && (
          <Box>
            <Tooltip title="Descargar datos en CSV">
              <span>
                <LoadingButton onClick={handleExportCsv} loading={loading} disabled={loading} color="primary" size="small" startIcon={<DownloadIcon />}>
                  CSV
                </LoadingButton>
              </span>
            </Tooltip>
            <Tooltip title="Enviar por email (PDF)">
              <span>
                <LoadingButton
                  onClick={handleSendEmail}
                  loading={loading}
                  disabled={loading}
                  color="secondary"
                  size="small"
                  startIcon={<EmailIcon />}
                  sx={{ ml: 1 }}
                >
                  Email
                </LoadingButton>
              </span>
            </Tooltip>
          </Box>
        )}
      </Box>

      {!embeddedConfig && (
        <Box mb={2}>
          <Alert severity="error">El dashboard que intentas visualizar no está disponible o ocurrió un problema al cargarlo.</Alert>
        </Box>
      )}

      <Box
        ref={supersetContainer}
        className="superset-container"
        sx={{
          width: "100%",
          minHeight: "85vh",
          position: "relative",
        }}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ShowDashboardPage;
