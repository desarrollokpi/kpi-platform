import React, { useMemo } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { Grid } from "@mui/material";
import { ToastContainer } from "react-toastify";

import AppBar from "./AppBar";
import Navigation from "./Navigation";
import roles from "./../../constants/roles";

const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.auth, shallowEqual);

  const isAdminOrSuperuser = useMemo(() => {
    if (!user) return false;

    const userRoles = Array.isArray(user.roles) ? user.roles : user?.role ? [user.role] : [];

    return userRoles.includes(roles.ADMIN) || userRoles.includes(roles.ROOT);
  }, [user]);

  return (
    <>
      <ToastContainer />
      <AppBar />

      <Grid container my={5}>
        {isAdminOrSuperuser && (
          <Grid item xs={12} md={2}>
            <Navigation />
          </Grid>
        )}

        <Grid item xs={12} md={isAdminOrSuperuser ? 10 : 12}>
          {children}
        </Grid>
      </Grid>
    </>
  );
};

export default Layout;
