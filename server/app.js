const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connection = require("./database");
const monitor = require("./logger");
const cors = require("./cors");

process.title = "server";

require("dotenv").config();

const useRoute = (entity) => {
  app.use(`/api/${entity}`, require(`./src/${entity}/${entity}.routes`));
};

// App initialization
const app = express();

// Middleware
app.use(express.json({ extended: false }));
app.use(monitor);
app.use(cors);
app.use(cookieParser());

// Routes Middleware
routes = [
  "admins",
  "contracts",
  "currencies",
  "identificationDocuments",
  "invoices",
  "locations",
  "powerbi",
  "reports",
  "sections",
  "superset",
  "superusers",
  "termsAndConditions",
  "users",
  "usersGroups",
  "workspaces",
];

routes.forEach((route) => useRoute(route));

// Listen
const PORT = process.env.PORT || 5050;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

function keepMySQLAlive() {
  connection.query("select 1", [], (error, _) => {
    if (error) throw error;
  });
}

const ONE_SECOND = 1000;

setInterval(keepMySQLAlive, ONE_SECOND * 10);
