const connection = require('../../database')
const invoicesQueries = require('./invoices.queries')

async function readInvoicesByContract(contractId) {
  return new Promise(resolve => {
    connection.query(
      invoicesQueries.READ_INVOICES_BY_CONTRACT,
      [contractId],
      (error, result) => {
        if (error) throw error

        return resolve(result)
      }
    )
  })
}

async function readInvoicesDetailByContract(contractId) {
  return new Promise(resolve => {
    connection.query(
      invoicesQueries.READ_INVOICES_DETAIL_BY_CONTRACT,
      [contractId],
      (error, results) => {
        if (error) throw error

        const invoiceDetails = results.map(result => ({
          ...result,
          quantity: parseInt(result.quantity),
          cost: parseFloat(result.cost),
          totalValue: parseFloat(result.totalValue),
        }))

        return resolve(invoiceDetails)
      }
    )
  })
}

module.exports = { readInvoicesByContract, readInvoicesDetailByContract }
