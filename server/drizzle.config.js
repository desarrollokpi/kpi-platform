const path = require("path");
const dotenv = require("dotenv");

const envPath = process.env.DRIZZLE_ENV || process.env.SEED_ENV || path.resolve(__dirname, "./config/.env.dev");

if (!process.env.DB_HOST) {
  dotenv.config({ path: envPath });
}

const dbCredentials = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

module.exports = {
  schema: "./src/db/schema/*.js",
  out: "./migrations",
  dialect: "mysql",
  dbCredentials,
};
