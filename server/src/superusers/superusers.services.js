const superusersRepository = require('./superusers.repository')
const superusersException = require('./superusers.exception')

const roles = require('../constants/roles')
const encrypt = require('../common/encrypt')

exports.readProfile = async superuserId => {
  const profile = await superusersRepository.readProfile(superuserId)

  profile.password = undefined
  profile.role = roles.SUPERUSER

  return profile
}
