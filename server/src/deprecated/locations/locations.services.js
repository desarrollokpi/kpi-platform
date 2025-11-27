const locationsRepository = require('./locations.repository')

async function readCountries() {
  return await locationsRepository.readCountries()
}

async function readRegions() {
  return await locationsRepository.readRegions()
}

async function readZones() {
  return await locationsRepository.readZones()
}

module.exports = { readCountries, readRegions, readZones }
