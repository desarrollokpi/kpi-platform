const connection = require('../../database')
const currenciesQueries = require('./currencies.queries')

async function readCurrencies() {
  return new Promise(resolve => {
    connection.query(currenciesQueries.READ_CURRENCIES, [], (error, result) => {
      if (error) throw error

      return resolve(result)
    })
  })
}

module.exports = { readCurrencies }
