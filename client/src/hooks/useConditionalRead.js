import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import useAuth from './useAuth'

const useConditionalRead = functions => {
  const dispatch = useDispatch()
  const isAuth = useAuth()

  useEffect(() => {
    if (isAuth)
      functions.forEach(fn => {
        if (fn.condition) dispatch(fn.fn())
      })
  }, [])
}

export default useConditionalRead
