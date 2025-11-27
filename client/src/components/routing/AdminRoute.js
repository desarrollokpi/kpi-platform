import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";

import Layout from "../layout/Layout";
import LayoutLoading from "../layout/LayoutLoading";

import useAdmin from "../../hooks/useAdmin";
import { readProfile } from "../../state/auth/authActions";

const AdminRoute = ({ children }) => {
  const dispatch = useDispatch();

  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(readProfile());
    }
  }, [dispatch, user]);

  if (adminLoading && !user) {
    return <LayoutLoading />;
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

export default AdminRoute;
