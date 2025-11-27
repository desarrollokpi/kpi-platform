const contractsServices = require('./contracts.services')

async function readContractByAdmin(req, res) {
  try {
    const contract = await contractsServices.readContractByAdmin(req.userId)

    res.send(contract)
  } catch (error) {
    return res.status(400).send(error)
  }
}

async function readContractDetailsByAdmin(req, res) {
  try {
    const contractDetails = await contractsServices.readContractDetailsByAdmin(
      req.userId,
      req.params.contractId
    )

    res.send(contractDetails)
  } catch (error) {
    return res.status(400).send(error)
  }
}

async function createContractByAdmin(req, res) {
  try {
    const {
      identificationDocumentId,
      identificationDocumentValue,
      address,
      zoneId,
      contractName,
      details,
    } = req.body

    const contractId = await contractsServices.createContractByAdmin(
      req.userId,
      identificationDocumentId,
      identificationDocumentValue,
      address,
      zoneId,
      contractName
    )

    await contractsServices.createContractDetailsByAdmin(contractId, details)

    res.send({ contractId })
  } catch (error) {
    return res.status(400).send(error)
  }
}

async function updateContractByAdmin(req, res) {
  try {
    const {
      identificationDocumentId,
      identificationDocumentValue,
      address,
      zoneId,
      contractName,
    } = req.body

    await contractsServices.updateContractByAdmin(
      identificationDocumentId,
      identificationDocumentValue,
      address,
      zoneId,
      contractName,
      req.params.contractId
    )

    const contract = await contractsServices.readContractByAdmin(req.userId)

    res.send(contract)
  } catch (error) {
    return res.status(400).send(error)
  }
}

async function updateContractDetailByAdmin(req, res) {
  try {
    await contractsServices.updateContractDetailByAdmin(
      req.params.contractDetailId,
      req.body.quantity
    )

    res.send({ message: 'Detalle de contrato actualizado con éxito' })
  } catch (error) {
    return res.status(400).send(error)
  }
}

module.exports = {
  createContractByAdmin,
  updateContractByAdmin,
  updateContractDetailByAdmin,
  readContractByAdmin,
  readContractDetailsByAdmin,
}
