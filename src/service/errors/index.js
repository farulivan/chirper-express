import { constants as httpConstants } from 'http2';

/**
 * Error representing an internal server error.
 */
export class ErrInternalServer extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INTERNAL_SERVER';
    this.statusCode = httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
  }
}

/**
 * Error representing an invalid message error, typically for bad request data.
 */
export class ErrInvalidMessage extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INVALID_MESSAGE';
    this.statusCode = httpConstants.HTTP_STATUS_BAD_REQUEST;
  }
}

/**
 * Error representing an invalid email format error.
 */
export class ErrInvalidEmail extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INVALID_EMAIL';
    this.statusCode = httpConstants.HTTP_STATUS_BAD_REQUEST;
  }
}

/**
 * Error representing an invalid password error, typically for password format validation.
 */
export class ErrInvalidPassword extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INVALID_PASSWORD';
    this.statusCode = httpConstants.HTTP_STATUS_BAD_REQUEST;
  }
}

/**
 * Error representing invalid credentials provided during authentication.
 */
export class ErrInvalidCreds extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INVALID_CREDS';
    this.statusCode = httpConstants.HTTP_STATUS_UNAUTHORIZED;
  }
}

/**
 * Error representing an invalid name error, typically used when validating user input.
 */
export class ErrInvalidName extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INVALID_NAME';
    this.statusCode = httpConstants.HTTP_STATUS_BAD_REQUEST;
  }
}

/**
 * Error representing an error when an email is already registered.
 */
export class ErrEmailAlreadyRegistered extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_EMAIL_ALREADY_REGISTERED';
    this.statusCode = httpConstants.HTTP_STATUS_CONFLICT;
  }
}

/**
 * Error representing an invalid access token.
 */
export class ErrInvalidAccessToken extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INVALID_ACCESS_TOKEN';
    this.statusCode = httpConstants.HTTP_STATUS_UNAUTHORIZED;
  }
}

/**
 * Error representing an invalid refresh token.
 */
export class ErrInvalidRefreshToken extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INVALID_REFRESH_TOKEN';
    this.statusCode = httpConstants.HTTP_STATUS_UNAUTHORIZED;
  }
}

/**
 * Error representing a resource not found error.
 */
export class ErrNotFound extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_NOT_FOUND';
    this.statusCode = httpConstants.HTTP_STATUS_NOT_FOUND;
  }
}

/**
 * Error representing a forbidden access error, typically when access is denied for an operation.
 */
export class ErrForbiddenAccess extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_FORBIDDEN_ACCESS';
    this.statusCode = httpConstants.HTTP_STATUS_FORBIDDEN;
  }
}
