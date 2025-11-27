const currenciesRepository = require('./currencies.repository')

async function readCurrencies() {
  return await currenciesRepository.readCurrencies()
}

module.exports = { readCurrencies }
