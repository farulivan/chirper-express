import TokenRepository from '../repository/auth/token/jwt/index.js';
import SessionRepository from '../repository/session/mysql/index.js';
import {
  ErrInvalidCreds,
  ErrInvalidEmail,
  ErrInvalidName,
  ErrInvalidPassword,
  ErrInvalidRefreshToken,
} from './errors/index.js';
import HashRepository from '../repository/auth/hash/bcrypt/index.js';

/**
 * Service responsible for managing user sessions, including login, registration,
 * and access token management.
 */
export default class SessionService {
  #sessionRepository;
  #tokenRepository;
  #hashRepository;

  /**
   *
   * @param {Object} config
   * @param {TokenRepository} config.tokenRepository
   * @param {SessionRepository} config.sessionRepository
   * @param {HashRepository} config.hashRepository
   */
  constructor({ sessionRepository, tokenRepository, hashRepository }) {
    this.#sessionRepository = sessionRepository;
    this.#tokenRepository = tokenRepository;
    this.#hashRepository = hashRepository;
  }

  /**
   * Authenticates a user and generates a new access token and refresh token.
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   * @returns {Promise<Object>} User's session information including tokens.
   * @throws {Error} When email or password validation fails.
   */
  async login(email, password) {
    if (!this.#validateEmail(email)) {
      throw new ErrInvalidEmail('invalid email format');
    }

    if (!this.#validatePasswordLength(password)) {
      throw new ErrInvalidPassword(
        'Password must be between 8 and 40 characters long'
      );
    }

    const user = await this.#sessionRepository.getUser(email);
    if (!user) {
      throw new ErrInvalidCreds('incorrect email or password');
    }

    const match = await this.#hashRepository.comparePassword(
      password,
      user.password
    );
    if (!match) {
      throw new ErrInvalidCreds('incorrect email or password');
    }

    // Generate and return the token
    const token = this.#tokenRepository.generateAccessToken(
      user.id,
      user.email,
      '5m'
    );

    const refreshToken = this.#tokenRepository.generateRefreshToken(
      user.id,
      user.email
    );

    // Save the refreshToken to database
    await this.#sessionRepository.saveRefreshToken(user.id, refreshToken);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      access_token: token,
      refresh_token: refreshToken,
    };
  }

  /**
   * Registers a new user and hashes their password for secure storage.
   * @param {string} name - User's name.
   * @param {string} email - User's email.
   * @param {string} password - User's chosen password.
   * @returns {Promise<Object>} Basic user information.
   * @throws {Error} When validation of name, email, or password fails.
   */
  async register(name, email, password) {
    if (!this.#validateEmail(email)) {
      throw new ErrInvalidEmail('invalid email format');
    }

    if (!this.#validateNameLength(name)) {
      throw new ErrInvalidName('Name must be between 3 and 60 characters long');
    }

    if (!this.#validatePasswordLength(password)) {
      throw new ErrInvalidPassword(
        'Password must be between 8 and 40 characters long'
      );
    }

    const hashedPassword = await this.#hashRepository.hashPassword(password);

    const newUser = await this.#sessionRepository.createUser(
      name,
      email,
      hashedPassword
    );

    // Return the basic user information
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };
  }

  /**
   * Generates a new access token using a valid refresh token.
   * @param {string} refreshToken - The refresh token to validate and use for generating a new access token.
   * @returns {Promise<string>} A new access token.
   * @throws {Error} When refresh token validation fails.
   */
  async getNewAccessToken(refreshToken) {
    // Decode and verify refreshToken
    const decoded = await this.#tokenRepository.verifyRefreshToken(
      refreshToken
    );

    // Check the database if the refreshToken is valid
    const isValidToken = await this.#sessionRepository.isRefreshTokenValid(
      decoded.id,
      refreshToken
    );

    if (!isValidToken) {
      throw new ErrInvalidRefreshToken('invalid refresh token');
    }

    // Generate a new access token
    const accessToken = this.#tokenRepository.generateAccessToken(
      decoded.id,
      decoded.email,
      '5m'
    );

    return accessToken;
  }

  /**
   * Validates an email address using a regular expression.
   *
   * @param {string} email - The email address to validate.
   * @returns {boolean} True if the email address matches the pattern, false otherwise.
   *
   * @example
   * // Returns true for valid email formats
   * validateEmail('example@test.com'); // true
   * validateEmail('user.name+tag@sub.domain.co.uk'); // true
   *
   * @example
   * // Returns false for invalid email formats
   * validateEmail('example@test'); // false, missing top-level domain
   * validateEmail('user@.com'); // false, missing domain name
   * validateEmail('@test.com'); // false, missing local part
   */
  #validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validates the length of a password.
   * @param {string} password - The password to validate.
   * @returns {boolean} True if the password meets the required length, false otherwise.
   */
  #validatePasswordLength(password) {
    return password.length >= 8 && password.length <= 40;
  }

  /**
   * Validates the length of a user's name.
   * @param {string} name - The user's name to validate.
   * @returns {boolean} True if the user's name meets the required length, false otherwise.
   */
  #validateNameLength(name) {
    return name.length >= 3 && name.length <= 60;
  }
}
