import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { getTimeAvailable } from '../state/auth/authActions'

const useSessionTimeAvailable = () => {
  const { user, timeAvailable } = useSelector(state => state.auth)
  const [show, setShow] = useState(true)

  const dispatch = useDispatch()

  const ONE_MINUTE = 60
  const SESSION_MAX_TIME = 5 * ONE_MINUTE

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(getTimeAvailable(user.role))
    }, ONE_MINUTE * 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (timeAvailable === SESSION_MAX_TIME) setShow(true)
    
    if (timeAvailable !== null && timeAvailable <= 5 * ONE_MINUTE && show) {
      toast.warning('La sesión se cerrará en 5 minutos por inactividad', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      })

      setShow(false)
    }
  }, [timeAvailable])
}

export default useSessionTimeAvailable
