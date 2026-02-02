const { AppError } = require('../lib/errors')

function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('[ERROR]', err)

  if (err instanceof AppError) {
    return res.status(err.status).json({
      ok: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || {},
      },
    })
  }

  // Postgres Error Codes
  if (err.code) {
    if (err.code === '23505') {
      return res.status(409).json({
        ok: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'The value already exists (Duplicate entry).',
          details: { constraint: err.constraint, detail: err.detail },
        },
      })
    }
    if (err.code === '23503') {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_REFERENCE',
          message: 'Invalid reference ID (Foreign Key violation).',
          details: { constraint: err.constraint, detail: err.detail },
        },
      })
    }
    if (err.code === '23502') {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'MISSING_FIELD',
          message: 'Missing required field (Not Null violation).',
          details: { column: err.column },
        },
      })
    }
  }

  return res.status(500).json({
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Something went wrong',
      details: {},
    },
  })
}

module.exports = { errorHandler }
