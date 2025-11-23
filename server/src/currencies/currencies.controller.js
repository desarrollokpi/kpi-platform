const currenciesServices = require('./currencies.services')

async function readCurrencies(req, res) {
  try {
    const currencies = await currenciesServices.readCurrencies()

    res.send(currencies)
  } catch (error) {
    return res.status(400).send(error)
  }
}

module.exports = { readCurrencies }
