const reportsServices = require("./reports.services");

exports.createReport = async (req, res, next) => {
  try {
    const { workspaceId, name, active } = req.body;

    const report = await reportsServices.createReport({
      workspaceId,
      name,
      active,
    });

    res.status(201).json({
      message: "Reporte creado exitosamente",
      report,
    });
  } catch (error) {
    next(error);
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await reportsServices.getReportById(parseInt(id));

    res.json({ report });
  } catch (error) {
    next(error);
  }
};

exports.getAllReports = async (req, res, next) => {
  try {
    const { active, limit, offset, listed = "false", mode, accountId } = req.query;

    const isSelectMode = mode === "select" || listed === "true";

    if (isSelectMode) {
      const list = await reportsServices.getReportsForSelect();
      return res.json(list);
    }

    const options = {};
    if (active !== undefined) options.active = active === "true";
    if (limit) options.limit = parseInt(limit, 10);
    if (offset) options.offset = parseInt(offset, 10);
    if (accountId) options.accountId = parseInt(accountId, 10);

    const reports = await reportsServices.getAllReports(options);

    const totalCount = limit || offset ? await reportsServices.getReportCount(options) : reports.length;

    res.json({ reports, count: reports.length, totalCount });
  } catch (error) {
    next(error);
  }
};

exports.updateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { workspaceId, name, active } = req.body;

    const report = await reportsServices.updateReport(parseInt(id), {
      workspaceId,
      name,
      active,
    });

    res.json({
      message: "Reporte actualizado exitosamente",
      report,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    await reportsServices.deleteReport(parseInt(id));

    res.json({
      message: "Reporte eliminado exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

exports.activateReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await reportsServices.activateReport(parseInt(id));

    res.json({
      message: "Reporte activado exitosamente",
      report,
    });
  } catch (error) {
    next(error);
  }
};

exports.deactivateReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await reportsServices.deactivateReport(parseInt(id));

    res.json({
      message: "Reporte desactivado exitosamente",
      report,
    });
  } catch (error) {
    next(error);
  }
};

exports.getReportsByWorkspace = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const reports = await reportsServices.getReportsByWorkspace(parseInt(workspaceId));

    res.json({ reports, count: reports.length });
  } catch (error) {
    next(error);
  }
};
