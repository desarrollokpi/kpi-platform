import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate } from 'react-router-dom'
import Layout from '../layout/Layout'
import useSuperuser from '../../hooks/useSuperuser'
import roles from '../../constants/roles'
import { readProfile } from '../../state/auth/authActions'
import LayoutLoading from '../layout/LayoutLoading'
import { useNavigate } from 'react-router-dom'

const SuperuserRoute = ({ children }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const isSuperuser = useSuperuser()

  const { loading: authLoading, user } = useSelector(state => state.auth)

  useEffect(() => {
    if (!isSuperuser) navigate('/login')
  }, [isSuperuser, navigate])

  useEffect(() => {
    dispatch(readProfile(roles.SUPERUSER))
  }, [dispatch])

  if (authLoading && !user) return <LayoutLoading />

  return isSuperuser ? <Layout>{children}</Layout> : <Navigate to='/login' />
}

export default SuperuserRoute
