const connection = require('../../database')
const locationsQueries = require('./locations.queries')

async function readCountries() {
  return new Promise(resolve => {
    connection.query(locationsQueries.READ_COUNTRIES, [], (error, result) => {
      if (error) throw error

      return resolve(result)
    })
  })
}

async function readRegions() {
  return new Promise(resolve => {
    connection.query(locationsQueries.READ_REGIONS, [], (error, result) => {
      if (error) throw error

      return resolve(result)
    })
  })
}

async function readZones() {
  return new Promise(resolve => {
    connection.query(locationsQueries.READ_ZONES, [], (error, result) => {
      if (error) throw error

      return resolve(result)
    })
  })
}

module.exports = { readCountries, readRegions, readZones }
