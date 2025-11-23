const cors = require('cors')
const adminServices = require('./src/admins/admins.services')

const subdomains = ['testclientqa', 'belenus', 'maquihuano', 'arnaiz']

const PORT = 3000
const LOCALHOST = `localhost:${PORT}`
const KPI_DOMAIN = 'kpimanagers.com'

const localhostSubdomains = subdomains.map(
  subdomain => `http://${subdomain}.${LOCALHOST}`
)

const kpiSubdomains = subdomains.map(
  subdomain => `https://${subdomain}.${KPI_DOMAIN}`
)

const whitelist = [
  'http://localhost:3000',
  ...localhostSubdomains,
  ...kpiSubdomains,
]

const kpiCors = cors({
  origin: whitelist,
  credentials: true,
})

module.exports = kpiCors
