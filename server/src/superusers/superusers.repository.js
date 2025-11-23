const connection = require('../../database')
const superusersQueries = require('./superusers.queries')

exports.readProfile = async superuserId => {
  return new Promise((resolve, reject) =>
    connection.query(
      superusersQueries.READ_PROFILE,
      [superuserId],
      async (error, rows) => {
        if (error) throw reject(error)

        const user = rows.pop()

        return resolve(user)
      }
    )
  )
}

exports.readByName = async name => {
  return new Promise((resolve, reject) =>
    connection.query(
      superusersQueries.READ_BY_NAME,
      [name],
      async (error, rows) => {
        if (error) throw reject(error)

        const user = rows.pop()

        return resolve(user)
      }
    )
  )
}
