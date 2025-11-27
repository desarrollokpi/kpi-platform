import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";

import Layout from "../layout/Layout";
import LayoutLoading from "../layout/LayoutLoading";

import useSuperuser from "../../hooks/useSuperuser";
import { readProfile } from "../../state/auth/authActions";

const SuperuserRoute = ({ children }) => {
  const dispatch = useDispatch();

  const { isSuperuser, loading: superuserLoading } = useSuperuser();
  const { user, loading: authLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(readProfile());
    }
  }, [dispatch, user]);

  if ((authLoading || superuserLoading) && !user) {
    return <LayoutLoading />;
  }

  if (!isSuperuser) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

export default SuperuserRoute;
