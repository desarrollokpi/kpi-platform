import { useMemo } from "react";
import { useSelector, shallowEqual } from "react-redux";

const useAccountId = () => {
  const { user } = useSelector(({ auth }) => auth, shallowEqual);

  const accountId = useMemo(() => {
    if (!user) return null;
    return user.accountId ?? null;
  }, [user]);

  return accountId;
};

export default useAccountId;
