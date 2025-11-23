const connection = require('../../database')
const identificationDocumentsQueries = require('./identificationDocuments.queries')

async function readIdentificationDocuments() {
  return new Promise(resolve => {
    connection.query(
      identificationDocumentsQueries.READ_IDENTIFICATION_DOCUMENTS,
      [],
      (error, result) => {
        if (error) throw error

        return resolve(result)
      }
    )
  })
}

module.exports = { readIdentificationDocuments }
