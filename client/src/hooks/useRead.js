import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import useAuth from './useAuth'

const useRead = (...functions) => {
  const dispatch = useDispatch()
  const isAuth = useAuth()

  useEffect(() => {
    if (isAuth) functions.forEach(fn => dispatch(fn()))
  }, [])
}

export default useRead
