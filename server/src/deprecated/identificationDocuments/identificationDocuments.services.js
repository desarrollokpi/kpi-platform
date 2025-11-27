const identificationDocumentsRepository = require('./identificationDocuments.repository')

async function readIdentificationDocuments() {
  return await identificationDocumentsRepository.readIdentificationDocuments()
}

module.exports = { readIdentificationDocuments }
