import React from 'react'
import { Navigate } from 'react-router-dom'
import Layout from './../layout/Layout'
import useAuth from './../../hooks/useAuth'

const PrivateRoute = ({ children }) => {
  const isAuth = useAuth()

  return isAuth ? <Layout>{children}</Layout> : <Navigate to='/login' />
}

export default PrivateRoute
