/**
 * Superset Controller
 *
 * LEGACY / DEPRECATED controller for backward compatibility.
 *
 * @deprecated Use /api/dashboards/:id/embeddedConfig instead
 *
 * This controller was used in the initial PoC but has been replaced by the integrated
 * dashboards embedded service which properly handles:
 * - embeddedId generation and storage
 * - Multi-tenant permission validation ("Regla de oro")
 * - Direct dashboard ID usage (no need to pass reportId separately)
 * - Proper multi-instance support via workspace hierarchy
 *
 * For new implementations, use:
 * - GET /api/dashboards/:id/embeddedConfig (returns { token, dashboardId, supersetDomain, dashboardName })
 */

const supersetInstancesService = require('../supersetInstances/supersetInstances.services');

/**
 * Generate embedded dashboard guest token (LEGACY)
 *
 * @deprecated Use /api/dashboards/:id/embeddedConfig instead
 *
 * This endpoint was used in TestingPage.js PoC but has been replaced.
 * Kept for backward compatibility only.
 *
 * @route POST /api/superset/generateEmbedded
 * @body {string} dashboardId - Dashboard UUID in Superset
 * @body {number} reportId - Report ID in our system (for multi-tenant RLS)
 * @body {Object} user - Optional user info override
 * @body {Array} rls - Optional RLS rules override
 * @returns {Object} { token, dashboardId, supersetDomain }
 */
exports.generateEmbedded = async (req, res) => {
  try {
    const { dashboardId, reportId, user: userOverride, rls: rlsOverride } = req.body;

    // Get authenticated user from JWT
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User ID not found in request. Please login first.',
      });
    }

    if (!dashboardId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'dashboardId is required',
      });
    }

    if (!reportId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'reportId is required for multi-tenant access control',
      });
    }

    // Generate guest token with multi-tenant RLS
    const result = await supersetInstancesService.generateGuestToken({
      userId,
      dashboardId,
      reportId,
    });

    // Format response for backward compatibility
    let response = {
      token: result.token,
      dashboardId: result.dashboardId,
      supersetDomain: result.supersetDomain,
    };

    // Handle Docker internal URLs
    if (response.supersetDomain.includes('docker') || response.supersetDomain.includes('host.docker.internal')) {
      response.supersetDomain = response.supersetDomain.replace('host.docker.internal', 'localhost');
    }

    console.log(`Generated guest token for user ${userId}, dashboard ${dashboardId}`);

    res.json(response);

  } catch (error) {
    console.error('Superset guest token error:', error.message);

    const statusCode = error.message.includes('not found') ? 404
      : error.message.includes('does not have access') ? 403
      : error.message.includes('inactive') ? 403
      : 500;

    res.status(statusCode).json({
      error: error.message,
      details: error.stack,
    });
  }
};

/**
 * Generate embedded dashboard guest token (Simple - no auth)
 *
 * This is a simplified version for testing/demo purposes.
 * Should NOT be used in production!
 *
 * @route POST /api/superset/generate-embedded-simple
 * @body {string} dashboardId - Dashboard UUID
 * @returns {Object} { token, dashboardId, supersetDomain }
 *
 * @deprecated For testing only - DO NOT USE IN PRODUCTION
 */
exports.generateEmbeddedSimple = async (req, res) => {
  try {
    const { dashboardId } = req.body;

    if (!dashboardId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'dashboardId is required',
      });
    }

    // Get default/first Superset instance
    const instances = await supersetInstancesService.getActiveSupersetInstances();

    if (instances.length === 0) {
      return res.status(500).json({
        error: 'No Superset instances configured',
        message: 'Please configure at least one active Superset instance',
      });
    }

    const instance = instances[0];
    const { createSupersetClient } = require('../supersetInstances/supersetApi.service');
    const client = createSupersetClient(instance);

    // Generate guest token without RLS (not secure!)
    const token = await client.generateGuestToken({
      dashboardId,
      user: {
        username: 'demo',
        first_name: 'Demo',
        last_name: 'User',
      },
      rls: [],
    });

    let response = {
      token,
      dashboardId,
      supersetDomain: instance.baseUrl,
    };

    // Handle Docker internal URLs
    if (response.supersetDomain.includes('docker') || response.supersetDomain.includes('host.docker.internal')) {
      response.supersetDomain = response.supersetDomain.replace('host.docker.internal', 'localhost');
    }

    console.warn('WARNING: Generated guest token without authentication - FOR TESTING ONLY');

    res.json(response);

  } catch (error) {
    console.error('Superset guest token error:', error.message);
    res.status(500).json({
      error: error.message,
      details: error.stack,
    });
  }
};
