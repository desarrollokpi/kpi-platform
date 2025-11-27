import React, { useMemo } from "react";
import { List, Paper, Collapse, Typography, IconButton, Grid, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import NavItem from "./NavItem";
import useResponsive from "./../../hooks/useResponsive";
import useAdmin from "./../../hooks/useAdmin";
import useSuperuser from "./../../hooks/useSuperuser";
import useToggle from "../../hooks/useToggle";
import { adminsRoutes, rootAdminRoutes } from "../../routes";

// Decide si una ruta debe aparecer en la navegación
const shouldShowInNav = (route) => {
  if (!route) return false;

  if (route.showInNav === false) return false;

  const path = route.path || "";

  return (
    !path.includes("/create") && !path.includes("/update") && !path.includes("/changePassword") && !path.includes("/assignDashboards") && !path.includes("/:")
  );
};

// Helper para construir el path final con prefijo
const buildPathWithPrefix = (prefix, path) => {
  const cleanPrefix = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanPrefix}${cleanPath}`;
};

const NavigationItems = ({ links, basePath, onItemClick }) => {
  if (!links || links.length === 0) return null;

  return (
    <List>
      {links.map((link) => {
        const finalPath = buildPathWithPrefix(basePath, link.path);

        return (
          <NavItem key={finalPath} to={finalPath} onClick={onItemClick} disabled={link.disabled}>
            <Typography variant="body1">{link.name}</Typography>
          </NavItem>
        );
      })}
    </List>
  );
};

const Navigation = () => {
  const matchLg = useResponsive("lg");
  const { isAdmin } = useAdmin();
  const { isSuperuser } = useSuperuser();
  const [open, toggleOpen] = useToggle();

  // Decidir rutas y prefijo según el rol
  const { links, basePath } = useMemo(() => {
    if (isSuperuser) {
      return {
        links: Object.values(rootAdminRoutes).filter(shouldShowInNav),
        basePath: "/superusers",
      };
    }

    if (isAdmin) {
      return {
        links: Object.values(adminsRoutes).filter(shouldShowInNav),
        basePath: "/admins",
      };
    }

    return { links: [], basePath: "" };
  }, [isAdmin, isSuperuser]);

  if (!links.length) return null;

  return (
    <>
      {matchLg ? (
        <Paper className="navigation">
          <NavigationItems links={links} basePath={basePath} />
        </Paper>
      ) : (
        <Paper className="navigation-mobile">
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={10}>
              <Typography align="center" variant="body2">
                Navegación
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <IconButton onClick={toggleOpen}>
                <MenuIcon />
              </IconButton>
            </Grid>
          </Grid>

          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ padding: "20px" }}>
              <NavigationItems links={links} basePath={basePath} onItemClick={toggleOpen} />
            </Box>
          </Collapse>
        </Paper>
      )}
    </>
  );
};

export default Navigation;
