class AppError extends Error {
  constructor({ code, message, status = 400, details = {} }) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
    this.details = details
  }
}

const Errors = {
  validation: (message = 'Validation error', details = {}) =>
    new AppError({ code: 'VALIDATION_ERROR', message, status: 422, details }),

  unauthenticated: (message = 'Unauthenticated', details = {}) =>
    new AppError({ code: 'UNAUTHENTICATED', message, status: 401, details }),

  forbidden: (message = 'Forbidden', details = {}) =>
    new AppError({ code: 'FORBIDDEN', message, status: 403, details }),

  notFound: (message = 'Not found', details = {}) =>
    new AppError({ code: 'NOT_FOUND', message, status: 404, details }),

  internal: (message = 'Internal error', details = {}) =>
    new AppError({ code: 'INTERNAL_ERROR', message, status: 500, details }),
}

module.exports = { AppError, Errors }
