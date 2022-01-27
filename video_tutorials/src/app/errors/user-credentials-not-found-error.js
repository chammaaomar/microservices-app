function UserCredentialsNotFoundError(message) {
	Error.captureStackTrace(this, this.constructor);
	this.message = message;
	this.name = 'UserCredentialsNotFoundError';
  }
  
UserCredentialsNotFoundError.prototype = Object.create(Error.prototype);
UserCredentialsNotFoundError.prototype.constructor = UserCredentialsNotFoundError;

module.exports = UserCredentialsNotFoundError;