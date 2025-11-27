const termsAndConditionsServices = require('./termsAndConditions.services')

async function readTermsAndConditions(req, res) {
  try {
    const termsAndConditions =
      await termsAndConditionsServices.readTermsAndConditions()

    res.send(termsAndConditions)
  } catch (error) {
    return res.status(400).send(error)
  }
}

module.exports = { readTermsAndConditions }
