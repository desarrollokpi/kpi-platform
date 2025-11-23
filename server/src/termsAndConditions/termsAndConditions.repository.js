const connection = require('../../database')
const termsAndConditionsQueries = require('./termsAndConditions.queries')

async function readTermsAndConditions() {
  return new Promise(resolve => {
    connection.query(
      termsAndConditionsQueries.READ_TERMS_AND_CONDITIONS,
      [],
      (error, result) => {
        if (error) throw error

        return resolve(result.pop())
      }
    )
  })
}

module.exports = { readTermsAndConditions }
