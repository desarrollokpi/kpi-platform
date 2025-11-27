const RedisRepository = require("../common/redis.repository");

class AuthRedisRepository extends RedisRepository {
  constructor() {
    super("auth-session");
  }
}

module.exports = new AuthRedisRepository();
