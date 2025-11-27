const { poolConnection } = require('../../../database')
const identificationDocumentsQueries = require('./identificationDocuments.queries')

async function readIdentificationDocuments() {
  const [rows] = await poolConnection.query(identificationDocumentsQueries.READ_IDENTIFICATION_DOCUMENTS)
  return rows
}

module.exports = { readIdentificationDocuments }
