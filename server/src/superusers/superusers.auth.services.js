const superusersRepository = require('./superusers.repository')
const superusersException = require('./superusers.exception')
const encrypt = require('../common/encrypt')

exports.signIn = async (name, password) => {
  const superuser = await superusersRepository.readByName(name)
  if (!superuser) throw new superusersException('El usuario no existe')

  const passwordsMatch = await encrypt.compare(password, superuser.password)
  if (!passwordsMatch) throw new superusersException('Contraseña no válida')

  return superuser.id
}

exports.signOut = async superuserId => {
  await superusersRedisRepository.removeById(superuserId)
}
