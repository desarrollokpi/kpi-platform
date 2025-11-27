const identificationDocumentsServices = require('./identificationDocuments.services')

async function readIdentificationDocuments(req, res) {
  try {
    const identificationDocuments =
      await identificationDocumentsServices.readIdentificationDocuments()

    res.send(identificationDocuments)
  } catch (error) {
    return res.status(400).send(error)
  }
}

module.exports = { readIdentificationDocuments }
