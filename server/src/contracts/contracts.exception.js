function ContractsException(message, description = undefined) {
  this.message = message
  this.description = description
  this.name = 'ContractsException'
}

module.exports = ContractsException
