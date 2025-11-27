const reportsRepository = require("./reports.repository");
const workspacesRepository = require("../workspaces/workspaces.repository");
const { ValidationError, NotFoundError, ConflictError } = require("../common/exception");

exports.createReport = async (reportData) => {
  const { workspacesId, name } = reportData;

  if (!workspacesId || !name) {
    throw new ValidationError("El workspacesId y el nombre son requeridos");
  }

  // Verify workspace exists
  const workspace = await workspacesRepository.findById(workspacesId);
  if (!workspace) {
    throw new NotFoundError("Workspace no encontrado");
  }

  // Check if report with same name already exists in this workspace
  const reports = await reportsRepository.findByWorkspace(workspacesId);
  const existingReport = reports.find((r) => r.name === name);

  if (existingReport) {
    throw new ConflictError(`Ya existe un reporte con el nombre "${name}" en este workspace`);
  }

  const result = await reportsRepository.createReport({
    workspacesId,
    name,
    active: reportData.active !== undefined ? reportData.active : true,
  });

  return await reportsRepository.findById(result.insertId);
};

exports.getReportById = async (id) => {
  const report = await reportsRepository.findById(id);

  if (!report) {
    throw new NotFoundError("Reporte no encontrado");
  }

  return report;
};

exports.getAllReports = async (options = {}) => {
  return await reportsRepository.findAll(options);
};

exports.getReportsForSelect = async () => {
  return await reportsRepository.getForSelect();
};

exports.getReportCount = async (activeOnly = false) => {
  return await reportsRepository.count(activeOnly);
};

exports.updateReport = async (id, updateData) => {
  const report = await reportsRepository.findById(id);

  if (!report) {
    throw new NotFoundError("Reporte no encontrado");
  }

  // If updating workspace, verify it exists
  if (updateData.workspacesId && updateData.workspacesId !== report.workspacesId) {
    const workspace = await workspacesRepository.findById(updateData.workspacesId);
    if (!workspace) {
      throw new NotFoundError("Workspace no encontrado");
    }
  }

  // If updating name, check for duplicates in the workspace
  if (updateData.name && updateData.name !== report.name) {
    const targetWorkspaceId = updateData.workspacesId || report.workspacesId;
    const reports = await reportsRepository.findByWorkspace(targetWorkspaceId);
    const existingReport = reports.find((r) => r.name === updateData.name && r.id !== id);

    if (existingReport) {
      throw new ConflictError(`Ya existe un reporte con el nombre "${updateData.name}" en este workspace`);
    }
  }

  await reportsRepository.updateReport(id, updateData);

  return await reportsRepository.findById(id);
};

exports.deleteReport = async (id) => {
  const report = await reportsRepository.findById(id);

  if (!report) {
    throw new NotFoundError("Reporte no encontrado");
  }

  await reportsRepository.softDelete(id);
};

exports.activateReport = async (id) => {
  const report = await reportsRepository.findById(id);

  if (!report) {
    throw new NotFoundError("Reporte no encontrado");
  }

  await reportsRepository.activate(id);

  return await reportsRepository.findById(id);
};

exports.getReportsByWorkspace = async (workspaceId) => {
  const workspace = await workspacesRepository.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace no encontrado");
  }

  return await reportsRepository.findByWorkspace(workspaceId);
};
