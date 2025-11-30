const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const monitor = require("./logger");

process.title = "KPI_API_SERVER";

require("dotenv").config();

const useRoute = (entity) => {
  app.use(`/api/${entity}`, require(`./src/${entity}/${entity}.routes`));
};

// App initialization
const app = express();

// Middleware
app.use(express.json({ extended: false }));
// CORS configured to reflect Origin so it works for localhost and production
// while still allowing credentials (cookies).
app.use(
  cors({
    origin: true, // reflect request origin
    credentials: true,
  })
);
app.use(monitor);
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
