const { poolConnection } = require('../../../database')
const superusersQueries = require('./superusers.queries')

exports.readProfile = async superuserId => {
  const [rows] = await poolConnection.query(superusersQueries.READ_PROFILE, [superuserId])
  return rows.pop()
}

exports.readByName = async name => {
  const [rows] = await poolConnection.query(superusersQueries.READ_BY_NAME, [name])
  return rows.pop()
}
