const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
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

const routes = ["auth", "accounts", "users", "roles", "instances", "workspaces", "reports", "dashboards"];

routes.forEach((route) => useRoute(route));

// Error handling middleware (must be after all routes)
const { notFoundHandler, errorHandler } = require("./src/middleware/errorHandler");
app.use(notFoundHandler);
app.use(errorHandler);

// Listen
const PORT = process.env.PORT || 5050;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
