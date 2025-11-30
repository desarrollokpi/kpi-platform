const axios = require("axios");

class ApacheSuperset {
  constructor(baseUrl, username, password) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.username = username;
    this.password = password;
    this.accessToken = null;
    this.refreshToken = null;
    this.csrfToken = null;
    this.sessionCookie = null;

    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Add request interceptor to inject auth headers
    this.client.interceptors.request.use(
      async (config) => {
        // Ensure we have a valid access token
        if (!this.accessToken && !config.url.includes("/security/login")) {
          await this.login();
        }

        // Inject tokens if available
        if (this.accessToken) {
          config.headers["Authorization"] = `Bearer ${this.accessToken}`;
        }

        if (config.url.includes("api/v1/security/guest_token")) {
          const { csrfToken, sessionCookie } = await this.getCsrfTokenSessionCookie();
          config.headers["X-CSRFToken"] = csrfToken;
          config.headers["Cookie"] = Array.isArray(sessionCookie) ? sessionCookie.join("; ") : sessionCookie;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token expiration
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying, login/refresh and retry.
        // Skip retry logic for the login endpoint itself to avoid infinite loops
        const status = error.response?.status;
        const isLoginRequest = originalRequest?.url?.includes("/security/login");

        if (status === 401 && !originalRequest._retry && !isLoginRequest) {
          originalRequest._retry = true;

          try {
            await this.login();
            return this.client(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async login() {
    try {
      const response = await this.client.post("/api/v1/security/login", {
        username: this.username,
        password: this.password,
        provider: "db",
        refresh: true,
      });

      this.accessToken = response.data.access_token.trim();
      this.refreshToken = response.data.refresh_token.trim();

      return response.data;
    } catch (error) {
      throw new Error(`Superset login failed: ${error.message}`);
    }
  }

  async getCsrfTokenSessionCookie() {
    try {
      const response = await this.client.get("/api/v1/security/csrf_token/");
      this.csrfToken = response.data.result;
      this.sessionCookie = response.headers["set-cookie"];
      return { csrfToken: this.csrfToken, sessionCookie: this.sessionCookie };
    } catch (error) {
      console.warn("Failed to get CSRF token:", error.message);
      return null;
    }
  }

  async refreshAccessToken() {
    try {
      const response = await this.client.post("/api/v1/security/refresh", {
        refresh_token: this.refreshToken,
      });

      this.accessToken = response.data.access_token;
      return response.data;
    } catch (error) {
      // If refresh fails, re-login
      return await this.login();
    }
  }

  async generateGuestToken(dashboardId) {
    try {
      const payload = {
        user: {
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
        rls: [],
      };

      const response = await this.client.post("/api/v1/security/guest_token/", payload);
      const dasboardUrl = this.baseUrl.includes("host.docker.internal") ? "http://localhost:8088" : this.baseUrl;

      return { token: response.data.token, dasboardUrl, dashboardId };
    } catch (error) {
      throw new Error(`Failed to generate guest token: ${error.message}`);
    }
  }

  async getDashboard(dashboardId) {
    try {
      const response = await this.client.get(`/api/v1/dashboard/${dashboardId}`);
      return response.data.result;
    } catch (error) {
      throw new Error(`Failed to get dashboard: ${error.message}`);
    }
  }

  async listDashboards() {
    try {
      const response = await this.client.get("/api/v1/dashboard/");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list dashboards: ${error.message}`);
    }
  }

  async getChart(chartId) {
    try {
      const response = await this.client.get(`/api/v1/chart/${chartId}`);
      return response.data.result;
    } catch (error) {
      throw new Error(`Failed to get chart: ${error.message}`);
    }
  }

  async getChartData(queryContext) {
    try {
      const payload = typeof queryContext === "string" && queryContext.trim().length > 0 ? JSON.parse(queryContext) : queryContext || {};

      const response = await this.client.post("/api/v1/chart/data", payload);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get chart data: ${error.message}`);
    }
  }

  async getEmbeddedDashboard(dashboardId) {
    try {
      const response = await this.client.get(`/api/v1/dashboard/${dashboardId}/embedded`);
      return response.data.result;
    } catch (error) {
      throw new Error(`Failed to get embedded dashboard: ${error.message}`);
    }
  }

  async getEmbeddedDashboardByUuid(uuid) {
    try {
      const response = await this.client.get(`/api/v1/embedded_dashboard/${uuid}`);
      return response.data.result;
    } catch (error) {
      throw new Error(`Failed to get embedded dashboard by uuid: ${error.message}`);
    }
  }

  /**
   * Enable embedded mode for a dashboard if it is not already enabled.
   * Returns the embedded configuration (including uuid).
   */
  async enableEmbeddedDashboard(dashboardId, allowedDomains = []) {
    try {
      // Try to reuse existing embedded config if present
      try {
        const existingConfig = await this.getEmbeddedDashboard(dashboardId);
        if (existingConfig && existingConfig.uuid) {
          return existingConfig;
        }
      } catch (error) {
        // If fetching existing config fails, continue and try to enable it
      }

      const payload = {
        allowed_domains: allowedDomains.length > 0 ? allowedDomains : [],
      };

      const response = await this.client.post(`/api/v1/dashboard/${dashboardId}/embedded`, payload);
      return response.data.result;
    } catch (error) {
      throw new Error(`Failed to enable embedded dashboard: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      await this.login();
      return true;
    } catch (error) {
      // Keep this silent at this layer; callers can decide how to react.
      return false;
    }
  }
}

const createApacheSuperSetClient = (instanceConfig) => {
  if (!instanceConfig || !instanceConfig.baseUrl) {
    throw new Error("Superset instance baseUrl is required");
  }

  const baseUrl = instanceConfig.baseUrl;
  const username = instanceConfig.apiUserName || instanceConfig.username;
  const password = instanceConfig.apiPassword || instanceConfig.password;

  if (!username) {
    throw new Error("Superset instance apiUserName is required");
  }

  if (!password) {
    throw new Error("Superset instance apiPassword is required");
  }

  return new ApacheSuperset(baseUrl, username, password);
};

module.exports = {
  ApacheSuperset,
  createApacheSuperSetClient,
};
