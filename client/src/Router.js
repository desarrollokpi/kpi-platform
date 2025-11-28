import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Routing
import SuperuserRoute from "./components/routing/SuperuserRoute";
import AdminRoute from "./components/routing/AdminRoute";
import PrivateRoute from "./components/routing/PrivateRoute";

// Pages
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

// Actions

import { readLogoBySubdomain } from "./state/accounts/accountsActions";
import { useDispatch } from "react-redux";

import { rootAdminRoutes, adminsRoutes, usersRoutes } from "./routes";

import useSubdomain from "./hooks/useSubdomain";
// import TestingPage from "./pages/TestingPage";

const Router = () => {
  const dispatch = useDispatch();
  const subdomain = useSubdomain();

  React.useEffect(() => {
    dispatch(readLogoBySubdomain(subdomain));
    // dispatch(readTermsAndConditions());
  }, [dispatch, subdomain]);

  const roleRoutes = (routes, prefix, AuthComponent) =>
    Object.values(routes).map((route) => (
      <Route
        key={route.path}
        path={`/${prefix}${route.path}`}
        element={
          <AuthComponent>
            <route.element />
          </AuthComponent>
        }
      />
    ));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {roleRoutes(rootAdminRoutes, "superusers", SuperuserRoute)}

        {roleRoutes(adminsRoutes, "admins", AdminRoute)}

        {roleRoutes(usersRoutes, "users", PrivateRoute)}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
