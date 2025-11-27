import React from "react";
import { Navigate } from "react-router-dom";
import Layout from "../layout/Layout";
import LayoutLoading from "../layout/LayoutLoading";
import useAuth from "../../hooks/useAuth";

const PrivateRoute = ({ children }) => {
  const { isAuth, loading, user } = useAuth();

  if (loading && !user) {
    return <LayoutLoading />;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

export default PrivateRoute;
