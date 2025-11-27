const { poolConnection } = require('../../../database')
const currenciesQueries = require('./currencies.queries')

async function readCurrencies() {
  const [rows] = await poolConnection.query(currenciesQueries.READ_CURRENCIES)
  return rows
}

module.exports = { readCurrencies }
