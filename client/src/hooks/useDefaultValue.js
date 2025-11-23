import { readProfile } from '../state/auth/authActions'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import roles from '../constants/roles'

const useDefaultValue = (
  sourceList,
  stateValue,
  stateSetter,
  field,
  dependencies
) => {
  useEffect(() => {
    if (sourceList.length > 0)
      stateSetter({ ...stateValue, [field]: sourceList[0].id })
  }, [thisWorkspaceReports.length])

  return isAuth
}

export default useAdmin
