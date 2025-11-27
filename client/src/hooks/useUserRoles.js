import { useMemo, useCallback } from "react";
import roles from "../constants/roles";
import { isDev } from "@util";

// Dev-only credentials. They won't exist in prod bundles.
const devCredentialsByRole = isDev()
  ? {
      [roles.ROOT]: { name: "root.admin", password: "RootAdmin#2025" },
      [roles.ADMIN]: { name: "acme.admin", password: "TenantAdmin#2025" },
      [roles.USER]: { name: "acme.user", password: "UserAccess#2025" },
    }
  : {};

const USER_ROLES = [
  {
    role: roles.USER,
    label: "Usuarios",
    redirectTo: "/users/dashboards",
  },
  {
    role: roles.ADMIN,
    label: "Administradores",
    redirectTo: "/admins/workspaces",
  },
  {
    role: roles.ROOT,
    label: "Superusuarios",
    redirectTo: "/superusers/accounts",
  },
].map((r) => ({
  ...r,
  devCredentials: devCredentialsByRole[r.role],
}));

const useUserRoles = () => {
  const userRoles = useMemo(() => USER_ROLES, []);

  const getRole = useCallback((roleName) => userRoles.find((r) => r.role === roleName), [userRoles]);

  const resolveUserRole = useCallback(
    (userRolesFromApi = []) => {
      const firstRoleName = userRolesFromApi?.[0];
      return firstRoleName ? getRole(firstRoleName) : undefined;
    },
    [getRole]
  );

  const getDevCredentials = useCallback(
    (roleName) => {
      if (!isDev()) return undefined;
      return getRole(roleName)?.devCredentials;
    },
    [getRole]
  );

  return { userRoles, getRole, resolveUserRole, getDevCredentials };
};

export default useUserRoles;
