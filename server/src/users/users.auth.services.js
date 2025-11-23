const usersRepository = require('./users.repository')
const usersRedisRepository = require('./users.redis.repository')
const UsersException = require('./users.exception')
const encrypt = require('../common/encrypt')

async function compareUsersIds(userId) {
  const sessionUserId = await usersRedisRepository.getById(userId)

  return sessionUserId === userId
}

async function signIn(name, password) {
  const user = await usersRepository.readByName(name)

  if (!user) throw new UsersException('El usuario no existe')

  const passwordsMatch = await encrypt.compare(password, user.password)
  const sessionIsActive = await compareUsersIds(user.id)

  if (!passwordsMatch) throw new UsersException('Contraseña no válida')

  if (sessionIsActive) {
    throw new UsersException(
      `El usuario ${user.name} ya está utilizando el sistema, intente con otro usuario o bien contáctelo para que libere la sesión`
    )
  }

  usersRedisRepository.addById(user.id)

  return user.id
}

async function signOut(userId) {
  await usersRedisRepository.removeById(userId)
}

async function refreshSession(userId) {
  await usersRedisRepository.setExpirationById(userId)
}

module.exports = { signIn, signOut, compareUsersIds, refreshSession }
