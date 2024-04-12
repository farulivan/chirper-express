import jwt from 'jsonwebtoken';
import {
  ErrInvalidAccessToken,
  ErrInvalidRefreshToken,
} from '../../../../service/errors/index.js';

/**
 * Manages JWT token operations such as creation and verification.
 */
export default class TokenRepository {
  /**
   * Creates an instance of TokenRepository.
   * @param {Object} config - The configuration object.
   * @param {string} config.accessTokenSecret - The secret key for access tokens.
   * @param {string} config.refreshTokenSecret - The secret key for refresh tokens.
   */
  constructor({ accessTokenSecret, refreshTokenSecret }) {
    this.accessTokenSecret = accessTokenSecret;
    this.refreshTokenSecret = refreshTokenSecret;
  }

  /**
   * Generates an access token for a user.
   * @param {number} userId - The user's ID.
   * @param {string} email - The user's email.
   * @param {string} expiresIn - The duration before the token expires.
   * @returns {string} The generated access token.
   */
  generateAccessToken(userId, email, expiresIn) {
    return jwt.sign({ id: userId, email }, this.accessTokenSecret, {
      expiresIn,
    });
  }

  /**
   * Generates a refresh token for a user.
   * @param {number} userId - The user's ID.
   * @param {string} email - The user's email.
   * @returns {string} The generated refresh token.
   */
  generateRefreshToken(userId, email) {
    return jwt.sign({ id: userId, email }, this.refreshTokenSecret);
  }

  /**
   * Verifies and decodes an access token.
   * @param {string} token - The access token to verify.
   * @returns {Object} The decoded token payload if verification is successful.
   * @throws {jwt.JsonWebTokenError} If token verification fails due to various reasons like expiration, invalid token, etc.
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessTokenSecret);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        // Handle JWT-related errors (e.g., token malformed, invalid signature)
        throw new ErrInvalidAccessToken('invalid access token');
      } else {
        // Handle any other unexpected errors
        throw new Error(error);
      }
    }
  }

  /**
   * Verifies and decodes a refresh token.
   * @param {string} token - The refresh token to verify.
   * @returns {Object} The decoded token payload if verification is successful.
   * @throws {jwt.JsonWebTokenError} If token verification fails due to various reasons like expiration, invalid token, etc.
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshTokenSecret);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        // Handle JWT-related errors (e.g., token malformed, invalid signature)
        throw new ErrInvalidRefreshToken('invalid refresh token');
      } else {
        // Handle any other unexpected errors
        throw new Error(error);
      }
    }
  }
}
