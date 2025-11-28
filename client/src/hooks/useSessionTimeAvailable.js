import { useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { toast } from "react-toastify";
import { Box, Typography, Button } from "@mui/material";
import { getTimeAvailable, refreshSession } from "../state/auth/authActions";

const ONE_MINUTE_SECONDS = 60;
const WARNING_THRESHOLD_SECONDS = 5 * ONE_MINUTE_SECONDS;

const useSessionTimeAvailable = () => {
  const dispatch = useDispatch();

  const { user, timeAvailable, isAuthenticated } = useSelector((state) => state.auth, shallowEqual);

  const roleName = useMemo(() => {
    if (!user) return undefined;
    if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles[0];
    return user.role;
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !roleName) return;

    dispatch(getTimeAvailable(roleName));

    const intervalId = setInterval(() => {
      dispatch(getTimeAvailable(roleName));
    }, ONE_MINUTE_SECONDS * 1000);

    return () => clearInterval(intervalId);
  }, [dispatch, isAuthenticated, roleName]);

  const previousTimeRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !roleName) {
      previousTimeRef.current = null;
      return;
    }

    if (timeAvailable === null || timeAvailable === undefined) {
      previousTimeRef.current = timeAvailable;
      return;
    }

    const prev = previousTimeRef.current;

    const justCrossedThreshold = (prev == null || prev > WARNING_THRESHOLD_SECONDS) && timeAvailable <= WARNING_THRESHOLD_SECONDS && timeAvailable > 0;

    if (justCrossedThreshold) {
      toast.warning(
        ({ closeToast }) => (
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="body2">
              La sesión se cerrará en 5 minutos por inactividad.
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                dispatch(refreshSession()).catch(() => {
                  // If refresh fails, timeAvailable polling and auth error handling will take care of logout.
                });
                closeToast();
              }}
            >
              Mantener sesión activa
            </Button>
          </Box>
        ),
        {
          position: "top-center",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        }
      );
    }

    previousTimeRef.current = timeAvailable;
  }, [timeAvailable, isAuthenticated, dispatch, roleName]);
};

export default useSessionTimeAvailable;
