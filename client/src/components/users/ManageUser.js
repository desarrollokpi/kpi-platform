import React, { useEffect, useMemo } from "react";
import { Grid, Paper, Button, Typography } from "@mui/material";
import useForm from "../../hooks/useForm";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { createUser, getAccountsLists, getRoleLists, updateUser } from "../../state/users/usersActions";
import { useParams, useNavigate } from "react-router-dom";
import useToggle from "../../hooks/useToggle";
import useNavigateAfterAction from "../../hooks/useNavigateAfterAction";
import useSuperuser from "../../hooks/useSuperuser";
import useAdmin from "../../hooks/useAdmin";
import LoadingButton from "@mui/lab/LoadingButton";
import ManageUserForm from "./ManageUserForm";
import CircularLoading from "../layout/CircularLoading";

// Pedir role, perdir accounts

const ManageUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuperuser } = useSuperuser();
  const { isAdmin } = useAdmin();

  const { users, loading, accountsList, rolesList } = useSelector(({ users }) => users, shallowEqual);
  const { user: currentUser } = useSelector(({ auth }) => auth, shallowEqual);
  const accountId = useMemo(() => currentUser?.accountId || null, [currentUser]);
  const prefixRoute = useMemo(() => (isSuperuser ? "superusers" : "admins"), [isSuperuser]);

  const initialState = {
    username: "",
    name: "",
    mail: "",
    confirmMail: "",
    password: "",
    confirmPassword: "",
    accountId: accountId | "",
    roleId: "",
  };

  let thisUser = undefined;

  const { userId } = useParams();

  if (userId) {
    thisUser = users.find((user) => user.id === parseInt(userId));
    if (thisUser) {
      thisUser = { ...thisUser, confirmMail: thisUser.mail };
    }
  }

  const buttonHasBeenClicked = useNavigateAfterAction(loading, `/${prefixRoute}/users`);

  const [user, bindField, areFieldsEmpty] = useForm(userId ? thisUser : initialState);

  const [active, handleSwitchChange] = useToggle(userId ? thisUser?.active : true);

  const handleManageUser = () => {
    let userData = { ...user, active };

    // Si es admin, inyectar el accountId automáticamente
    if (isAdmin && accountId) {
      userData = { ...userData, accountId: accountId };
    }

    dispatch(userId ? updateUser(userData) : createUser(userData));

    buttonHasBeenClicked();
  };

  useEffect(() => {
    if (isSuperuser) {
      dispatch(getAccountsLists());
      dispatch(getRoleLists());
    }
  }, [isSuperuser, getRoleLists, getAccountsLists]);

  if (loading && userId && !thisUser) {
    return (
      <Paper className="container">
        <CircularLoading />
      </Paper>
    );
  }

  if (userId && !thisUser && !loading) {
    return (
      <Paper className="container">
        <Typography variant="h6" align="center" color="error">
          Usuario no encontrado
        </Typography>
        <Grid container justifyContent="center" mt={3}>
          <Button onClick={() => navigate(`/${prefixRoute}/users`)}>Volver a la lista</Button>
        </Grid>
      </Paper>
    );
  }

  // Si es admin, verificar que solo edite usuarios de su propia cuenta
  if (isAdmin && userId && thisUser && thisUser.accountsId !== accountId) {
    return (
      <Paper className="container">
        <Typography variant="h6" align="center" color="error">
          No tienes permisos para editar este usuario
        </Typography>
        <Grid container justifyContent="center" mt={3}>
          <Button onClick={() => navigate(`/${prefixRoute}/users`)}>Volver a la lista</Button>
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper className="container">
      <ManageUserForm
        userId={userId}
        bindField={bindField}
        active={active}
        handleSwitchChange={handleSwitchChange}
        isSuperuser={isSuperuser}
        accounts={accountsList}
        roles={rolesList}
      />

      <Grid mt={3} container justifyContent="space-between">
        <Button onClick={() => navigate(`/${prefixRoute}/users`)}>Cancelar</Button>
        <LoadingButton onClick={handleManageUser} variant="contained" loading={loading} disabled={areFieldsEmpty}>
          {userId ? "Guardar cambios" : "Crear usuario"}
        </LoadingButton>
      </Grid>
    </Paper>
  );
};

export default ManageUser;
