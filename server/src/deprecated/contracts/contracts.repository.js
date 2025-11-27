const { poolConnection } = require('../../../database')
const contractsQueries = require('./contracts.queries')

// documentId = id_int_id_type
async function createContractByAdmin(
  adminId,
  identityDocumentId,
  identityDocumentValue,
  address,
  zoneId,
  contractName
) {
  const [result] = await poolConnection.query(contractsQueries.CREATE_CONTRACT_BY_ADMIN, [
    adminId,
    identityDocumentId,
    identityDocumentValue,
    address,
    zoneId,
    contractName,
  ])

  return result.insertId
}

async function createContractDetailsByAdmin(contractId, details) {
  const contractDetails = details.map(detail => [contractId, detail])

  await poolConnection.query(contractsQueries.CREATE_CONTRACT_DETAILS_BY_ADMIN, [contractDetails])
}

async function updateContractByAdmin(
  identityDocumentId,
  identityDocumentValue,
  address,
  zoneId,
  contractName,
  contractId
) {
  await poolConnection.query(contractsQueries.UPDATE_CONTRACT_BY_ADMIN, [
    identityDocumentId,
    identityDocumentValue,
    address,
    zoneId,
    contractName,
    contractId,
  ])
}

async function updateContractDetailByAdmin(contractDetailId, quantity) {
  await poolConnection.query(contractsQueries.UPDATE_CONTRACT_DETAIL_BY_ADMIN, [quantity, contractDetailId])
}

async function readContractByAdmin(adminId) {
  const [rows] = await poolConnection.query(contractsQueries.READ_CONTRACT_BY_ADMIN, [adminId])
  return rows.pop()
}

async function readContractDetailsByAdmin(adminId, contractId) {
  const [results] = await poolConnection.query(contractsQueries.READ_CONTRACT_DETAILS_BY_ADMIN, [contractId, adminId])

  const contractDetails = results[1].map(result => ({
    ...result,
    quantity: parseInt(result.quantity),
    cost: parseFloat(result.cost),
  }))

  return contractDetails
}

module.exports = {
  createContractByAdmin,
  updateContractByAdmin,
  createContractDetailsByAdmin,
  updateContractDetailByAdmin,
  readContractByAdmin,
  readContractDetailsByAdmin,
}
