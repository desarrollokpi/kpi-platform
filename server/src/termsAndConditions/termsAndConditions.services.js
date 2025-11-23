const termsAndConditionsRepository = require('./termsAndConditions.repository')

async function readTermsAndConditions() {
  return await termsAndConditionsRepository.readTermsAndConditions()
}

module.exports = { readTermsAndConditions }
