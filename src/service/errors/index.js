import { constants as httpConstants } from 'http2';

export class ErrInternalServer extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INTERNAL_SERVER';
    this.statusCode = httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
  }
}

export class ErrInvalidMessage extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INVALID_MESSAGE';
    this.statusCode = httpConstants.HTTP_STATUS_BAD_REQUEST;
  }
}

export class ErrInvalidEmail extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INVALID_EMAIL';
    this.statusCode = httpConstants.HTTP_STATUS_BAD_REQUEST;
  }
}

export class ErrInvalidPassword extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INVALID_PASSWORD';
    this.statusCode = httpConstants.HTTP_STATUS_BAD_REQUEST;
  }
}

export class ErrInvalidCreds extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INVALID_CREDS';
    this.statusCode = httpConstants.HTTP_STATUS_UNAUTHORIZED;
  }
}

export class ErrInvalidName extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INVALID_NAME';
    this.statusCode = httpConstants.HTTP_STATUS_BAD_REQUEST;
  }
}

export class ErrEmailAlreadyRegistered extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_EMAIL_ALREADY_REGISTERED';
    this.statusCode = httpConstants.HTTP_STATUS_CONFLICT;
  }
}

export class ErrInvalidAccessToken extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INVALID_ACCESS_TOKEN';
    this.statusCode = httpConstants.HTTP_STATUS_UNAUTHORIZED;
  }
}

export class ErrInvalidRefreshToken extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INVALID_REFRESH_TOKEN';
    this.statusCode = httpConstants.HTTP_STATUS_UNAUTHORIZED;
  }
}

export class ErrNotFound extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_NOT_FOUND';
    this.statusCode = httpConstants.HTTP_STATUS_NOT_FOUND;
  }
}

export class ErrForbiddenAccess extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_FORBIDDEN_ACCESS';
    this.statusCode = httpConstants.HTTP_STATUS_FORBIDDEN;
  }
}
