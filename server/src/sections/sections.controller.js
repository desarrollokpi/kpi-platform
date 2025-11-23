const sectionsServices = require('./sections.services')

exports.readSectionsByAdmin = async (req, res) => {
  try {
    const sections = await sectionsServices.readSectionsByAdmin(req.userId)

    res.send(sections)
  } catch (error) {
    return res.status(400).send(error.message)
  }
}

exports.readSectionsByUser = async (req, res) => {
  const { userId, adminId } = req

  try {
    const sections = await sectionsServices.readSectionsByUser(userId, adminId)

    res.send(sections)
  } catch (error) {
    return res.status(400).send(error.message)
  }
}

exports.readSectionsByReport = async (req, res) => {
  const { reportId } = req.query

  try {
    const sections = await sectionsServices.readSectionsByReport(reportId)

    res.send(sections)
  } catch (error) {
    return res.status(400).send(error.message)
  }
}
