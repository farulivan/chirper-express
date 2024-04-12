import {
  ErrForbiddenAccess,
  ErrInternalServer,
} from '../service/errors/index.js';

function errorMiddleware(error, req, res, next) {
  // Specific handling for ErrForbiddenAccess
  if (error instanceof ErrForbiddenAccess) {
    return res.status(error.statusCode).json({
      ok: false,
      err: error.name,
      msg: error.message,
      ts: Math.floor(Date.now() / 1000), // Current timestamp in seconds
    });
  }

  // Generic handling for other errors with a statusCode
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      err: error.name,
      msg: error.message,
    });
  }

  // For unknown errors, log the error and respond with 500 Internal Server Error
  const internalError = new ErrInternalServer(error);
  res.status(internalError.statusCode).json({
    err: internalError.name,
    msg: internalError.message,
  });
}

export default errorMiddleware;
