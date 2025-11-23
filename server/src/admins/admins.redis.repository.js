const RedisRepository = require('./../common/redis.repository')
const roles = require('./../constants/roles')

module.exports = new RedisRepository(roles.ADMIN)
