const invoicesRepository = require('./invoices.repository')

async function readInvoicesByContract(contractId) {
  return await invoicesRepository.readInvoicesByContract(contractId)
}

async function readInvoicesDetailByContract(contractId) {
  return await invoicesRepository.readInvoicesDetailByContract(contractId)
}

module.exports = { readInvoicesByContract, readInvoicesDetailByContract }
