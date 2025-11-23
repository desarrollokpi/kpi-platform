function AdminsException(message, description = undefined) {
  this.message = message
  this.description = description
  this.name = 'AdminsException'
}

module.exports = AdminsException
