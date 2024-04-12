import TokenRepository from '../repository/auth/token/jwt/index.js';
import { ErrInvalidAccessToken } from '../service/errors/index.js';

/**
 * Middleware factory that creates an authentication middleware using a TokenRepository.
 * @param {TokenRepository} tokenRepository The repository to use for token operations.
 * @returns {Function} Middleware function for authenticating tokens.
 */
export default function authenticateToken(tokenRepository) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token from 'Bearer TOKEN'

    if (!token) {
      throw new ErrInvalidAccessToken('invalid access token');
    }

    const user = tokenRepository.verifyAccessToken(token);
    req.user = user;
    next();
  };
}
