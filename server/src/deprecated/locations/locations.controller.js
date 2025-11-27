const locationsServices = require('./locations.services')

async function readCountries(req, res) {
  try {
    const countries = await locationsServices.readCountries()

    res.send(countries)
  } catch (error) {
    return res.status(400).send(error)
  }
}

async function readRegions(req, res) {
  try {
    const regions = await locationsServices.readRegions()

    res.send(regions)
  } catch (error) {
    return res.status(400).send(error)
  }
}

async function readZones(req, res) {
  try {
    const zones = await locationsServices.readZones()

    res.send(zones)
  } catch (error) {
    return res.status(400).send(error)
  }
}

module.exports = { readCountries, readRegions, readZones }
