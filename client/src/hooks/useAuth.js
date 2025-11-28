import { useEffect, useMemo } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { readProfile } from "../state/auth/authActions";

const useAuth = () => {
  const dispatch = useDispatch();

  const { user, isAuthenticated, loading } = useSelector((state) => state.auth, shallowEqual);

  const isAuth = useMemo(() => {
    return Boolean(user && isAuthenticated);
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (!user && !loading) {
      dispatch(readProfile());
    }
  }, [dispatch, user, loading]);

  return { isAuth, loading, user };
};

export default useAuth;
