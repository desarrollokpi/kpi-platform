import { useSelector } from 'react-redux'
import roles from '../constants/roles'

const useSuperuser = () => {
  const { user, isAuthenticated, loading } = useSelector(state => state.auth)

  const isSuperuser =
    (user && isAuthenticated && user.role === roles.SUPERUSER) || loading

  return isSuperuser
}

export default useSuperuser
