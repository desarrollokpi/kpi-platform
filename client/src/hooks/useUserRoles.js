import { useState } from 'react'
import roles from '../constants/roles'

const testSuperuser = {
  name: 'kpigestion',
  password: '@268296',
}

const testAdmin = {
  name: 'rpdea',
  password: '12345',
}

const testUser = {
  name: 'ftrentacoste',
  password: '12345',
}

const userRoles = [
  {
    role: roles.USER,
    label: 'Usuarios',
    devCredentials: testUser,
    redirectTo: '/users/reports',
  },
  {
    role: roles.ADMIN,
    label: 'Administradores',
    devCredentials: testAdmin,
    redirectTo: '/admins/reports-groups',
  },
  {
    role: roles.SUPERUSER,
    label: 'Superusuarios',
    devCredentials: testSuperuser,
    redirectTo: '/superusers/admins',
  },
]

const useUserRoles = () => {
  const [userRoleName, setUserRoleName] = useState(roles.ADMIN)

  const userRole = userRoles.find(({ role }) => role === userRoleName)

  return { userRoleName, setUserRoleName, userRoles, userRole }
}

export default useUserRoles
