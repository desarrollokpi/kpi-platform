const mysql2 = require("mysql2");
require("dotenv").config();

const isProd = process.env.PRODUCTION === "true";

const config = {
  multipleStatements: true,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
};

if (isProd) {
  config.ssl = {
    rejectUnauthorized: false,
  };
}

module.exports = mysql2.createConnection(config);
