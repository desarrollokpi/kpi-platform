const redisClient = require("../../redis");

const ONE_MINUTE = 60;
const SESSION_DURATION = ONE_MINUTE * 15;

class RedisRepository {
  constructor(entity) {
    this.entity = entity;
  }

  entityKey = (entityId) => {
    return `${this.entity}-${entityId}`;
  };

  setExpirationById = async (entityId) => {
    await redisClient.expire(this.entityKey(entityId), SESSION_DURATION);
  };

  addById = async (entityId) => {
    await redisClient.set(this.entityKey(entityId), entityId.toString());
    await this.setExpirationById(entityId);
  };

  removeById = async (entityId) => {
    await redisClient.del(this.entityKey(entityId));
  };

  getById = async (entityId) => {
    const entityIdString = await redisClient.get(this.entityKey(entityId));
    return parseInt(entityIdString);
  };

  getTimeToLiveById = async (entityId) => {
    return await redisClient.ttl(this.entityKey(entityId));
  };
}

module.exports = RedisRepository;
