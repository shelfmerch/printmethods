class NotFoundError extends Error {
  constructor(resource = 'Resource', message = null) {
    super(message || `${resource} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.code = 'NOT_FOUND';
  }
}

module.exports = { NotFoundError };
