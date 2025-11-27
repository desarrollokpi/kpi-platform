import { useEffect, useRef } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { toast } from "react-toastify";
import { getTimeAvailable } from "../state/auth/authActions";

const ONE_MINUTE_SECONDS = 60;
const WARNING_THRESHOLD_SECONDS = 5 * ONE_MINUTE_SECONDS;

const useSessionTimeAvailable = () => {
  const dispatch = useDispatch();

  const { user, timeAvailable, isAuthenticated } = useSelector((state) => state.auth, shallowEqual);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const role = Array.isArray(user.roles) && user.roles.length > 0 ? user.roles[0] : user.role;

    if (!role) return;

    dispatch(getTimeAvailable(role));

    const intervalId = setInterval(() => {
      dispatch(getTimeAvailable(role));
    }, ONE_MINUTE_SECONDS * 1000);

    return () => clearInterval(intervalId);
  }, [dispatch, isAuthenticated, user]);

  const previousTimeRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      previousTimeRef.current = null;
      return;
    }

    if (timeAvailable == null) {
      previousTimeRef.current = timeAvailable;
      return;
    }

    const prev = previousTimeRef.current;

    const justCrossedThreshold = (prev == null || prev > WARNING_THRESHOLD_SECONDS) && timeAvailable <= WARNING_THRESHOLD_SECONDS && timeAvailable > 0;

    if (justCrossedThreshold) {
      toast.warning("La sesión se cerrará en 5 minutos por inactividad", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }

    previousTimeRef.current = timeAvailable;
  }, [timeAvailable, isAuthenticated]);
};

export default useSessionTimeAvailable;
