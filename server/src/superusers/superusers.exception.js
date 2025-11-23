function superusersException(message, description = undefined) {
  this.message = message
  this.description = description
  this.name = 'superusersException'
}

module.exports = superusersException
