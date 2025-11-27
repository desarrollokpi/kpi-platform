/**
 * Apache Superset API Client Service
 *
 * Handles communication with Apache Superset REST API for:
 * - Authentication (login, access tokens)
 * - Guest token generation for embedded dashboards
 * - Dashboard, chart, and database management
 *
 * @see https://superset.apache.org/docs/api/
 * @see https://github.com/apache/superset/discussions/29824
 */

const axios = require('axios');

/**
 * SupersetApiClient - Client for interacting with Apache Superset REST API
 */
class SupersetApiClient {
  /**
   * @param {string} baseUrl - Superset instance base URL (e.g., https://superset.example.com)
   * @param {string} username - Superset admin username
   * @param {string} password - Superset admin password
   */
  constructor(baseUrl, username, password) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.username = username;
    this.password = password;
    this.accessToken = null;
    this.refreshToken = null;
    this.csrfToken = null;

    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to inject auth headers
    this.client.interceptors.request.use(
      async (config) => {
        // Ensure we have a valid access token
        if (!this.accessToken && !config.url.includes('/security/login')) {
          await this.login();
        }

        // Inject tokens if available
        if (this.accessToken) {
          config.headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        if (this.csrfToken) {
          config.headers['X-CSRFToken'] = this.csrfToken;
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

        // If 401 and not already retrying, refresh token and retry
        if (error.response?.status === 401 && !originalRequest._retry) {
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

  /**
   * Login to Superset and obtain access token
   * @returns {Promise<Object>} Login response with access_token
   */
  async login() {
    try {
      const response = await this.client.post('/api/v1/security/login', {
        username: this.username,
        password: this.password,
        provider: 'db',
        refresh: true,
      });

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;

      // Get CSRF token
      await this.getCsrfToken();

      return response.data;
    } catch (error) {
      throw new Error(`Superset login failed: ${error.message}`);
    }
  }

  /**
   * Get CSRF token required for POST/PUT/DELETE requests
   * @returns {Promise<string>} CSRF token
   */
  async getCsrfToken() {
    try {
      const response = await this.client.get('/api/v1/security/csrf_token/');
      this.csrfToken = response.data.result;
      return this.csrfToken;
    } catch (error) {
      console.warn('Failed to get CSRF token:', error.message);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   * @returns {Promise<Object>} Refresh response with new access_token
   */
  async refreshAccessToken() {
    try {
      const response = await this.client.post('/api/v1/security/refresh', {
        refresh_token: this.refreshToken,
      });

      this.accessToken = response.data.access_token;
      return response.data;
    } catch (error) {
      // If refresh fails, re-login
      return await this.login();
    }
  }

  /**
   * Generate guest token for embedded dashboard access
   *
   * @param {Object} params - Guest token parameters
   * @param {string} params.dashboardId - Dashboard UUID
   * @param {Object} params.user - User information { username, first_name, last_name }
   * @param {Array} params.rls - Row Level Security rules (optional)
   * @param {Object} params.resources - Resources to grant access to
   * @returns {Promise<string>} Guest token
   *
   * @example
   * const token = await client.generateGuestToken({
   *   dashboardId: 'abc-123',
   *   user: { username: 'john.doe', first_name: 'John', last_name: 'Doe' },
   *   rls: [{ clause: 'tenant_id = 5' }]
   * });
   */
  async generateGuestToken({ dashboardId, user, rls = [], resources = null }) {
    try {
      const payload = {
        user: {
          username: user.username || 'guest',
          first_name: user.first_name || 'Guest',
          last_name: user.last_name || 'User',
        },
        resources: resources || [
          {
            type: 'dashboard',
            id: dashboardId,
          },
        ],
        rls: rls.length > 0 ? rls : [],
      };

      const response = await this.client.post('/api/v1/security/guest_token/', payload);

      return response.data.token;
    } catch (error) {
      throw new Error(`Failed to generate guest token: ${error.message}`);
    }
  }

  /**
   * Get dashboard by ID
   * @param {string} dashboardId - Dashboard UUID or ID
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboard(dashboardId) {
    try {
      const response = await this.client.get(`/api/v1/dashboard/${dashboardId}`);
      return response.data.result;
    } catch (error) {
      throw new Error(`Failed to get dashboard: ${error.message}`);
    }
  }

  /**
   * List all dashboards
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.pageSize - Page size (default: 20)
   * @returns {Promise<Object>} Dashboards list
   */
  async listDashboards({ page = 0, pageSize = 20 } = {}) {
    try {
      const response = await this.client.get('/api/v1/dashboard/', {
        params: {
          q: JSON.stringify({
            page,
            page_size: pageSize,
          }),
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list dashboards: ${error.message}`);
    }
  }

  /**
   * Get chart by ID
   * @param {number} chartId - Chart ID
   * @returns {Promise<Object>} Chart data
   */
  async getChart(chartId) {
    try {
      const response = await this.client.get(`/api/v1/chart/${chartId}`);
      return response.data.result;
    } catch (error) {
      throw new Error(`Failed to get chart: ${error.message}`);
    }
  }

  /**
   * List all charts
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.pageSize - Page size (default: 20)
   * @returns {Promise<Object>} Charts list
   */
  async listCharts({ page = 0, pageSize = 20 } = {}) {
    try {
      const response = await this.client.get('/api/v1/chart/', {
        params: {
          q: JSON.stringify({
            page,
            page_size: pageSize,
          }),
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list charts: ${error.message}`);
    }
  }

  /**
   * Get database by ID
   * @param {number} databaseId - Database ID
   * @returns {Promise<Object>} Database data
   */
  async getDatabase(databaseId) {
    try {
      const response = await this.client.get(`/api/v1/database/${databaseId}`);
      return response.data.result;
    } catch (error) {
      throw new Error(`Failed to get database: ${error.message}`);
    }
  }

  /**
   * List all databases
   * @returns {Promise<Object>} Databases list
   */
  async listDatabases() {
    try {
      const response = await this.client.get('/api/v1/database/');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list databases: ${error.message}`);
    }
  }

  /**
   * Execute SQL query on a database
   * @param {Object} params - Query parameters
   * @param {number} params.databaseId - Database ID
   * @param {string} params.sql - SQL query
   * @param {string} params.schema - Database schema (optional)
   * @returns {Promise<Object>} Query results
   */
  async executeQuery({ databaseId, sql, schema = null }) {
    try {
      const payload = {
        database_id: databaseId,
        sql,
      };

      if (schema) {
        payload.schema = schema;
      }

      const response = await this.client.post('/api/v1/sqllab/execute/', payload);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to execute query: ${error.message}`);
    }
  }

  /**
   * Get embedded dashboard configuration
   * @param {string} dashboardId - Dashboard UUID
   * @returns {Promise<Object>} Embedded dashboard config
   */
  async getEmbeddedDashboard(dashboardId) {
    try {
      const response = await this.client.get(`/api/v1/dashboard/${dashboardId}/embedded`);
      return response.data.result;
    } catch (error) {
      throw new Error(`Failed to get embedded dashboard: ${error.message}`);
    }
  }

  /**
   * Enable embedded dashboard and get UUID
   * If dashboard is already embedded, returns existing config
   * @param {string} dashboardId - Dashboard UUID or ID
   * @param {Array} allowedDomains - Allowed domains for embedding (optional)
   * @returns {Promise<Object>} Embedded dashboard config with uuid
   */
  async enableEmbeddedDashboard(dashboardId, allowedDomains = []) {
    try {
      // Check if already embedded
      try {
        const existingConfig = await this.getEmbeddedDashboard(dashboardId);
        if (existingConfig && existingConfig.uuid) {
          return existingConfig;
        }
      } catch (error) {
        // Dashboard not embedded yet, continue to enable it
      }

      // Enable embedded dashboard
      const payload = {
        allowed_domains: allowedDomains.length > 0 ? allowedDomains : []
      };

      const response = await this.client.post(`/api/v1/dashboard/${dashboardId}/embedded`, payload);
      return response.data.result;
    } catch (error) {
      throw new Error(`Failed to enable embedded dashboard: ${error.message}`);
    }
  }

  /**
   * Test connection to Superset instance
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    try {
      await this.login();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user info
   * @returns {Promise<Object>} Current user data
   */
  async getCurrentUser() {
    try {
      const response = await this.client.get('/api/v1/me/');
      return response.data.result;
    } catch (error) {
      throw new Error(`Failed to get current user: ${error.message}`);
    }
  }
}

/**
 * Factory function to create SupersetApiClient instances
 * @param {Object} supersetInstance - Superset instance from database
 * @param {string} supersetInstance.baseUrl - Base URL of Superset instance
 * @param {string} supersetInstance.apiUserName - Admin username (optional, falls back to env)
 * @param {string} supersetInstance.apiPassword - Admin password (optional, falls back to env)
 * @returns {SupersetApiClient} Configured API client
 */
function createSupersetClient(supersetInstance) {
  if (!supersetInstance.baseUrl) {
    throw new Error('Superset instance baseUrl is required');
  }

  // Use instance credentials if available, otherwise fall back to env vars
  const username = supersetInstance.apiUserName || process.env.SUPERSET_ADMIN_USERNAME || 'admin';
  const password = supersetInstance.apiPassword || process.env.SUPERSET_ADMIN_PASSWORD || 'admin';

  return new SupersetApiClient(
    supersetInstance.baseUrl,
    username,
    password
  );
}

module.exports = {
  SupersetApiClient,
  createSupersetClient,
};
