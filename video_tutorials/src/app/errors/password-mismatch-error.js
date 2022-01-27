function PasswordMismatchError(message) {
	Error.captureStackTrace(this, this.constructor);
	this.message = message;
	this.name = 'PasswordMismatchError';
  }
  
  PasswordMismatchError.prototype = Object.create(Error.prototype);
  PasswordMismatchError.prototype.constructor = PasswordMismatchError;
  
  module.exports = PasswordMismatchError;