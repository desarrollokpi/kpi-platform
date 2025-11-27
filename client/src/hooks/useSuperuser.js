import { useSelector, shallowEqual } from "react-redux";
import { useMemo } from "react";
import roles from "../constants/roles";

const useSuperuser = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth, shallowEqual);

  const isSuperuser = useMemo(() => {
    if (!user || !isAuthenticated) return false;

    const hasRootRole = Array.isArray(user.roles) ? user.roles.includes(roles.ROOT) : user.role === roles.ROOT;
    const hasNoAccount = !user.accountId;

    return hasRootRole && hasNoAccount;
  }, [user, isAuthenticated]);

  return { isSuperuser, loading };
};

export default useSuperuser;
