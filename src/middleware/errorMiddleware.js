import {
  ErrForbiddenAccess,
  ErrInternalServer,
} from '../service/errors/index.js';

/**
 * Express middleware for handling errors throughout the application.
 * It checks the type of error and responds with appropriate HTTP status codes and messages.
 * This middleware helps to centralize error handling and make the responses consistent.
 *
 * @param {Error} error - The error object thrown by previous middleware or route handlers.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object used to send responses to the client.
 * @param {import('express').NextFunction} next - The next middleware function in the stack.
 */
export default function errorMiddleware(error, req, res, next) {
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
