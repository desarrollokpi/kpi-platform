const reportsServices = require('./reports.services')

exports.createReportGroupByAdmin = async (req, res) => {
  try {
    const { code, name, active, sections } = req.body

    await reportsServices.createReportGroupByAdmin(
      req.userId,
      code,
      name,
      active,
      sections
    )

    res.send({ message: 'Grupo de reportes creado exitosamente' })
  } catch (error) {
    return res.status(400).send(error.stack)
  }
}

exports.readReportGroupsByAdmin = async (req, res) => {
  try {
    const reportGroups = await reportsServices.readReportGroupsByAdmin(
      req.userId
    )

    res.send(reportGroups)
  } catch (error) {
    return res.status(400).send(error)
  }
}

exports.readReportsByAdmin = async (req, res) => {
  try {
    const reports = await reportsServices.readReportsByAdmin(req.userId)

    res.send(reports)
  } catch (error) {
    return res.status(400).send(error)
  }
}

exports.readReportsByUser = async (req, res) => {
  const { userId, adminId } = req

  try {
    const reports = await reportsServices.readReportsByUser(userId, adminId)

    res.send(reports)
  } catch (error) {
    return res.status(400).send(error)
  }
}

exports.readReportsByWorkspace = async (req, res) => {
  const { workspaceId } = req.query

  try {
    const reports = await reportsServices.readReportsByWorkspace(workspaceId)

    res.send(reports)
  } catch (error) {
    return res.status(400).send(error)
  }
}

exports.readUsersReportsByAdmin = async (req, res) => {
  try {
    const reports = await reportsServices.readUsersReportsByAdmin(req.userId)

    res.send(reports)
  } catch (error) {
    return res.status(400).send(error)
  }
}

exports.updateReportGroupByAdmin = async (req, res) => {
  const { reportGroupId } = req.params
  const { code, name, active, sections } = req.body

  try {
    await reportsServices.updateReportGroupByAdmin(
      req.userId,
      reportGroupId,
      code,
      name,
      active,
      sections
    )

    const reportGroups = await reportsServices.readReportGroupsByAdmin(
      req.userId
    )

    res.send(reportGroups)
  } catch (error) {
    return res.status(400).send(error.stack)
  }
}

exports.updateReportActiveStateByAdmin = async (req, res) => {
  const { active, workspaceId } = req.body

  try {
    await reportsServices.updateReportActiveStateByAdmin(
      req.userId,
      req.params.reportId,
      active,
      workspaceId
    )

    const adminReports = await reportsServices.readReportsByAdmin(req.userId)

    res.send(adminReports)
  } catch (error) {
    return res.status(400).send(error)
  }
}
