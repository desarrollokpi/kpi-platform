import { readProfile } from '../state/auth/authActions'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import roles from '../constants/roles'

const useAdmin = () => {
  const dispatch = useDispatch()
  const location = useLocation()

  const { user, isAuthenticated, loading } = useSelector(state => state.auth)

  const isAuth =
    (user && isAuthenticated && user.role === roles.ADMIN) || loading

  // useEffect(() => {
  //   if (user) dispatch(readProfile(user.role))
  // }, [dispatch, location])

  return isAuth
}

export default useAdmin
