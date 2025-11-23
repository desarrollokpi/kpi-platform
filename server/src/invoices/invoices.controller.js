const invoicesServices = require('./invoices.services')

async function readInvoicesByContract(req, res) {
  try {
    const invoices = await invoicesServices.readInvoicesByContract(
      req.params.contractId
    )

    res.send(invoices)
  } catch (error) {
    return res.status(400).send(error)
  }
}

async function readInvoicesDetailByContract(req, res) {
  try {
    const invoicesDetails = await invoicesServices.readInvoicesDetailByContract(
      req.params.contractId
    )

    res.send(invoicesDetails)
  } catch (error) {
    return res.status(400).send(error)
  }
}

module.exports = { readInvoicesByContract, readInvoicesDetailByContract }
