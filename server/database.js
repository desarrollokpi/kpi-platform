const mysql2 = require("mysql2/promise");
const { drizzle } = require("drizzle-orm/mysql2");
require("dotenv").config();

const isProd = process.env.PRODUCTION === "true" || process.env.NODE_ENV === "production";

const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

if (isProd) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const poolConnection = mysql2.createPool(poolConfig);
const db = drizzle(poolConnection, { mode: "default" });

module.exports = {
  db,
  poolConnection,
};
