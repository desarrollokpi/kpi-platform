const { poolConnection } = require('../../database')
const termsAndConditionsQueries = require('./termsAndConditions.queries')

async function readTermsAndConditions() {
  const [rows] = await poolConnection.query(termsAndConditionsQueries.READ_TERMS_AND_CONDITIONS)
  return rows.pop()
}

module.exports = { readTermsAndConditions }
