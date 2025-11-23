const axios = require("axios");

const SUPERSET_URL = process.env.SUPERSET_URL || "http://host.docker.internal:8088";

// Función auxiliar para obtener el access token de admin
const getAdminAccessToken = async () => {
  const response = await axios.post(`${SUPERSET_URL}/api/v1/security/login`, {
    username: process.env.SUPERSET_ADMIN_USER || "admin",
    password: process.env.SUPERSET_ADMIN_PASSWORD || "admin",
    provider: "db",
    refresh: true,
  });

  return response.data.access_token;
};

// Función auxiliar para obtener el CSRF token
const getCsrfToken = async (accessToken) => {
  const response = await axios.get(`${SUPERSET_URL}/api/v1/security/csrf_token/`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return { csrfToken: response.data.result, sessionCookie: response.headers["set-cookie"] };
};

exports.generateEmbedded = async (req, res) => {
  try {
    const { dashboardId, user, rls = [] } = req.body;

    // Obtener access token y CSRF token
    const accessToken = await getAdminAccessToken();
    const { csrfToken, sessionCookie } = await getCsrfToken(accessToken);

    console.log("Access Token obtenido:", accessToken ? "OK" : "FAIL");
    console.log("CSRF Token obtenido:", csrfToken ? "OK" : "FAIL");

    // Crear el guest token
    const guestTokenResponse = await axios.post(
      `${SUPERSET_URL}/api/v1/security/guest_token/`,
      {
        user: user || {
          username: "guest",
          first_name: "Guest",
          last_name: "User",
        },
        resources: [
          {
            type: "dashboard",
            id: dashboardId,
          },
        ],
        rls: rls,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          Cookie: Array.isArray(sessionCookie) ? sessionCookie.join("; ") : sessionCookie,
        },
      }
    );

    let response = {
      token: guestTokenResponse.data.token,
      dashboardId,
      supersetDomain: SUPERSET_URL,
    };

    if (response.supersetDomain.includes("docker")) {
      response.supersetDomain = response.supersetDomain.replace("host.docker.internal", "localhost");
    }

    res.json(response);
  } catch (error) {
    console.log("Guest token error:", error.response?.data || error.message);
    console.error("Superset guest token error:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
};
