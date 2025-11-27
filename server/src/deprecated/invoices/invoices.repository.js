const { poolConnection } = require('../../../database')
const invoicesQueries = require('./invoices.queries')

async function readInvoicesByContract(contractId) {
  const [rows] = await poolConnection.query(invoicesQueries.READ_INVOICES_BY_CONTRACT, [contractId])
  return rows
}

async function readInvoicesDetailByContract(contractId) {
  const [results] = await poolConnection.query(invoicesQueries.READ_INVOICES_DETAIL_BY_CONTRACT, [contractId])

  return results.map(result => ({
    ...result,
    quantity: parseInt(result.quantity),
    cost: parseFloat(result.cost),
    totalValue: parseFloat(result.totalValue),
  }))
}

module.exports = { readInvoicesByContract, readInvoicesDetailByContract }
