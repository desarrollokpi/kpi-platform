// import { useEffect } from 'react'
// import { useSelector, useDispatch } from 'react-redux'
// import { readTermsAndConditions } from '../state/termsAndConditions/termsAndConditionsActions'

// const useTermsAndConditions = () => {
//   const dispatch = useDispatch()
//   const { user } = useSelector(state => state.auth)
//   const { termsAndConditions } = useSelector(state => state.termsAndConditions)

//   useEffect(() => {
//     if (!termsAndConditions) dispatch(readTermsAndConditions())
//   }, [])

//   const userAcceptedTermsAndConditions = user?.termsAndConditions?.includes(
//     termsAndConditions?.id
//   )

//   return userAcceptedTermsAndConditions
// }

// export default useTermsAndConditions
