const { poolConnection } = require('../../database')
const locationsQueries = require('./locations.queries')

async function readCountries() {
  const [rows] = await poolConnection.query(locationsQueries.READ_COUNTRIES)
  return rows
}

async function readRegions() {
  const [rows] = await poolConnection.query(locationsQueries.READ_REGIONS)
  return rows
}

async function readZones() {
  const [rows] = await poolConnection.query(locationsQueries.READ_ZONES)
  return rows
}

module.exports = { readCountries, readRegions, readZones }
