import { useSelector, shallowEqual } from "react-redux";
import { useMemo } from "react";
import roles from "../constants/roles";

const useAdmin = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth, shallowEqual);

  const isAdmin = useMemo(() => {
    if (!user || !isAuthenticated) return false;

    const hasAdminRole = Array.isArray(user.roles) ? user.roles.includes(roles.ADMIN) : user.role === roles.ADMIN;
    const hasAccount = !!user.accountId; // true si tiene un valor "truthy"

    return hasAdminRole && hasAccount;
  }, [user, isAuthenticated]);

  return { isAdmin, loading };
};

export default useAdmin;
