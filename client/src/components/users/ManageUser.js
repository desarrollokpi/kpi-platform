import React, { useEffect, useMemo } from "react";
import { Grid, Paper, Button, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

import useForm from "../../hooks/useForm";
import useToggle from "../../hooks/useToggle";
import useNavigateAfterAction from "../../hooks/useNavigateAfterAction";
import useSuperuser from "../../hooks/useSuperuser";
import useAdmin from "../../hooks/useAdmin";

import { createUser, getAccountsLists, getRoleLists, updateUser } from "../../state/users/usersActions";

import ManageUserForm from "./ManageUserForm";
import CircularLoading from "../layout/CircularLoading";

const ManageUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();

  const { isSuperuser } = useSuperuser();
  const { isAdmin } = useAdmin();

  const { users, loading, accountsList, rolesList } = useSelector(({ users }) => users, shallowEqual);
  const { user: currentUser } = useSelector(({ auth }) => auth, shallowEqual);

  const accountId = useMemo(() => currentUser?.accountId || null, [currentUser]);

  const prefixRoute = useMemo(() => (isSuperuser ? "superusers" : "admins"), [isSuperuser]);

  const initialState = useMemo(
    () => ({
      userName: "",
      name: "",
      mail: "",
      confirmMail: "",
      password: "",
      confirmPassword: "",
      accountId: accountId || "",
      roleId: "",
    }),
    [accountId]
  );

  const allowEmptyFields = useMemo(() => (isSuperuser ? ["accountId"] : []), [isSuperuser]);

  const thisUser = useMemo(() => {
    if (!userId) return undefined;

    const id = Number.parseInt(userId, 10);
    if (Number.isNaN(id)) return undefined;

    const found = users.find((u) => u.id === id);
    if (!found) return undefined;

    const primaryRoleId = Array.isArray(found.roles) && found.roles[0]?.id ? found.roles[0].id : "";

    return {
      ...found,
      confirmMail: found.mail,
      roleId: primaryRoleId,
      accountId: found.accountsId ?? "",
    };
  }, [userId, users]);

  const rolesForForm = useMemo(() => {
    if (!rolesList) return rolesList;

    const editingUserHasAccount = Boolean(userId) && thisUser && thisUser.accountId !== null && thisUser.accountId !== undefined;

    if (editingUserHasAccount) {
      return rolesList.filter((role) => role.labelRaw !== "root_admin");
    }

    return rolesList;
  }, [rolesList, userId, thisUser]);

  const buttonHasBeenClicked = useNavigateAfterAction(loading, `/${prefixRoute}/users`);

  const [formValues, bindField, areFieldsEmpty, setFields] = useForm(initialState, { allowEmpty: allowEmptyFields });

  useEffect(() => {
    if (userId && thisUser) {
      setFields(thisUser);
    }
  }, [userId, thisUser, setFields]);

  const [active, handleSwitchChange] = useToggle(userId ? Boolean(thisUser?.active) : true);

  const handleManageUser = () => {
    let userData = { ...formValues, active };

    if (isAdmin && accountId) {
      userData = { ...userData, accountId };
    }

    const selectedRole = rolesList?.find((role) => String(role.value) === String(userData.roleId));
    const isRootRole = selectedRole && /root/i.test(String(selectedRole.labelRaw || selectedRole.label || ""));

    if (isRootRole) {
      userData.accountId = null;
    }

    const action = userId ? updateUser(userId, userData) : createUser(userData);

    dispatch(action);
    buttonHasBeenClicked();
  };

  useEffect(() => {
    if (isSuperuser) {
      dispatch(getAccountsLists());
      dispatch(getRoleLists());
    }
  }, [isSuperuser, dispatch]);

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
        roles={rolesForForm}
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
