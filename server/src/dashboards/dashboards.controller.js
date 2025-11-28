const dashboardsServices = require("./dashboards.services");

exports.createDashboard = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const dashboard = await dashboardsServices.createDashboard(req.body, userId);
    res.status(201).json(dashboard);
  } catch (error) {
    next(error);
  }
};

exports.getAllDashboards = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { active, limit, offset, reportId, accountId } = req.query;

    const options = {};

    if (active !== undefined) {
      options.active = active === "true";
    }
    if (limit) {
      options.limit = parseInt(limit);
    }
    if (offset) {
      options.offset = parseInt(offset);
    }
    if (reportId) {
      options.reportId = parseInt(reportId);
    }
    if (accountId) {
      options.accountId = parseInt(accountId);
    }

    const dashboards = await dashboardsServices.getAllDashboards(options, userId);

    // Get total count for pagination (respect filters)
    const totalCount = limit || offset ? await dashboardsServices.getDashboardCount(options, userId) : dashboards.length;

    res.json({
      dashboards,
      count: dashboards.length,
      totalCount,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardsInstancesForSelect = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { reportId } = req.query;
    const list = await dashboardsServices.getDashboardsInstancesForSelect({ reportId: parseInt(reportId) });

    res.json(list);
  } catch (error) {
    next(error);
  }
};

exports.getDashboardById = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const dashboard = await dashboardsServices.getDashboardById(parseInt(id), userId);

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

exports.updateDashboard = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const dashboard = await dashboardsServices.updateDashboard(parseInt(id), req.body, userId);

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

exports.deleteDashboard = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    await dashboardsServices.softDeleteDashboard(parseInt(id), userId);

    res.json({ success: true, message: "Dashboard deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.assignDashboardToUser = async (req, res, next) => {
  try {
    const adminUserId = req.userId;
    if (!adminUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required in request body" });
    }

    const result = await dashboardsServices.assignDashboardToUser(parseInt(id), parseInt(userId), adminUserId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.removeDashboardFromUser = async (req, res, next) => {
  try {
    const adminUserId = req.userId;
    if (!adminUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id, userId } = req.params;

    const result = await dashboardsServices.removeDashboardFromUser(parseInt(id), parseInt(userId), adminUserId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getUserDashboards = async (req, res, next) => {
  try {
    const requestingUserId = req.userId;
    if (!requestingUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { userId } = req.params;
    const targetUserId = parseInt(userId);

    // Users can only see their own dashboards unless they are admins
    const permissionsService = require("../common/permissions.service");
    const isRootAdmin = await permissionsService.isRootAdmin(requestingUserId);
    const isTenantAdmin = await permissionsService.isTenantAdmin(requestingUserId);

    if (!isRootAdmin && !isTenantAdmin && requestingUserId !== targetUserId) {
      return res.status(403).json({ error: "You can only view your own dashboards" });
    }

    // If Tenant Admin, validate same tenant
    if (isTenantAdmin && !isRootAdmin) {
      const { db } = require("../../database");
      const { sql } = require("drizzle-orm");

      const [rows] = await db.execute(sql`
        SELECT
          u1.accounts_id as adminAccountId,
          u2.accounts_id as targetAccountId
        FROM users u1, users u2
        WHERE u1.id = ${requestingUserId} AND u2.id = ${targetUserId}
      `);

      if (!rows || rows.length === 0 || rows[0].adminAccountId !== rows[0].targetAccountId) {
        return res.status(403).json({ error: "You can only view dashboards of users in your tenant" });
      }
    }

    const dashboards = await dashboardsServices.getUserDashboards(targetUserId);

    res.json({ dashboards, count: dashboards.length });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardUsers = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const users = await dashboardsServices.getDashboardUsers(parseInt(id), userId);

    res.json({ users, count: users.length });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardsAssignableToUser = async (req, res, next) => {
  try {
    const adminUserId = req.userId;
    if (!adminUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { userId } = req.params;
    const dashboards = await dashboardsServices.getDashboardsAssignableToUser(parseInt(userId), adminUserId);

    res.json({
      dashboards,
      count: dashboards.length,
      totalCount: dashboards.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardEmbedInfo = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const embeddedService = require("./dashboards.embedded.service");
    const config = await embeddedService.getDashboardEmbeddedConfig(parseInt(id), userId);

    res.json(config);
  } catch (error) {
    next(error);
  }
};

exports.exportDashboardToCsv = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const exportService = require("./dashboards.export.service");
    const { csv, filename, contentType } = await exportService.exportDashboardDataToCsv(parseInt(id), userId);

    // Set headers for CSV download
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

exports.sendDashboardEmail = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const pdfService = require("./dashboards.pdf.service");
    const result = await pdfService.sendDashboardEmail(parseInt(id), userId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getDashboardEmbeddedConfig = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const embeddedService = require("./dashboards.embedded.service");
    const config = await embeddedService.getDashboardEmbeddedConfig(parseInt(id), userId);

    res.json(config);
  } catch (error) {
    next(error);
  }
};
