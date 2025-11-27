import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch, shallowEqual } from "react-redux";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Button from "@mui/material/Button";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import SettingsIcon from "@mui/icons-material/Settings";
import KeyIcon from "@mui/icons-material/Key";
import LogoutIcon from "@mui/icons-material/Logout";

import { signOut } from "../../state/auth/authActions";
import roles from "../../constants/roles";
import Image from "./Image";
import useMenu from "@hooks/useMenu";

const ApplicationBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const matchesLg = useMediaQuery(theme.breakpoints.up("lg"));

  const { user, isAuthenticated, loading: authLoading } = useSelector((state) => state.auth, shallowEqual);
  const { loading: loadingReports } = useSelector((state) => state.reports, shallowEqual);
  const { appBarLogo } = useSelector((state) => state.accounts, shallowEqual);

  const [anchorEl, handleOpenMenu, handleCloseMenu] = useMenu();

  const isLoggedIn = Boolean(user && isAuthenticated);

  const primaryRole = useMemo(() => {
    if (!user) return undefined;
    if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles[0];
    return user.role;
  }, [user]);

  const isUser = primaryRole === roles.USER;

  const handleSignOut = useCallback(() => {
    dispatch(signOut(primaryRole));
    handleCloseMenu();
  }, [dispatch, primaryRole, handleCloseMenu]);

  const handleChangePassword = useCallback(() => {
    navigate("/users/changePassword");
    handleCloseMenu();
  }, [navigate, handleCloseMenu]);

  const isSigningOutDisabled = authLoading || loadingReports;

  return (
    <AppBar position="sticky" color="light">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          {appBarLogo && <Image src={appBarLogo} alt="logo" width={matchesLg ? undefined : 120} style={{ maxHeight: "70px", objectFit: "contain" }} />}
        </Box>

        {isLoggedIn && (
          <>
            <Typography mr={1} variant="body1" color="secondary">
              Usuario:
            </Typography>
            <Typography sx={{ mr: 2 }}>{user.userName}</Typography>

            {isUser && (
              <>
                <IconButton onClick={handleOpenMenu} color="inherit">
                  <SettingsIcon />
                </IconButton>

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                  <MenuItem onClick={handleChangePassword}>
                    <ListItemIcon>
                      <KeyIcon fontSize="small" />
                    </ListItemIcon>
                    Cambiar contraseña
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleSignOut} disabled={isSigningOutDisabled}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Salir
                  </MenuItem>
                </Menu>
              </>
            )}

            {!isUser && (
              <Button endIcon={<LogoutIcon fontSize="small" />} onClick={handleSignOut} disabled={isSigningOutDisabled} color="primary">
                Salir
              </Button>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default ApplicationBar;
