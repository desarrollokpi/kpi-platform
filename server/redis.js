const redis = require("redis");

const host = process.env.REDIS_HOST || "127.0.0.1";
const port = Number(process.env.REDIS_PORT || "6379");
const password = process.env.REDIS_PASSWORD || null;

// Base options for Redis client
const options = {
  socket: {
    host,
    port,
  },
};

if (password) {
  options.password = password;
}

const client = redis.createClient(options);

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

(async () => {
  try {
    await client.connect();
    console.log(`Redis connected to ${host}:${port}` + (password ? " (with authentication)" : " (without authentication)"));
  } catch (err) {
    console.error("Error connecting to Redis:", err);
  }
})();

module.exports = client;
