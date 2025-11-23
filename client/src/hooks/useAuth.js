import { readProfile } from '../state/auth/authActions'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

const useAuth = () => {
  const dispatch = useDispatch()
  const location = useLocation()

  const { user, isAuthenticated } = useSelector(state => state.auth)

  const isAuth = user && isAuthenticated

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (user) dispatch(readProfile(user.role))
  }, [dispatch, location])

  return isAuth
}

export default useAuth
