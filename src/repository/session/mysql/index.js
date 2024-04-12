import pool from '../../../database/database.js';
import { ErrEmailAlreadyRegistered } from '../../../service/errors/index.js';

/**
 * Repository for handling user sessions.
 * Provides functionalities to interact with user and session data in the database.
 */
export default class SessionRepository {
  /**
   * Retrieves a user by their email address.
   * @param {string} email - The email address to search for.
   * @returns {Promise<Object|null>} A user object if found, otherwise null.
   */
  async getUser(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    if (rows.length === 0) {
      return null; // Return null to indicate no user found
    }

    const user = rows[0];
    return user;
  }

  /**
   * Creates a new user in the database.
   * @param {string} name - The name of the user.
   * @param {string} email - The email of the user.
   * @param {string} hashedPassword - The hashed password for the user.
   * @returns {Promise<Object>} The created user's ID, name, and email.
   * @throws {ErrEmailAlreadyRegistered} If the email is already registered.
   * @throws {ErrInternalServer} If there is an unexpected SQL error.
   */
  async createUser(name, email, hashedPassword) {
    try {
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())',
        [name, email, hashedPassword]
      );

      const userId = result.insertId;
      return { id: userId, name, email };
    } catch (error) {
      // Check for duplicate email error code
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ErrEmailAlreadyRegistered(
          'given email is already registered.'
        );
      }
      throw new Error(error);
    }
  }

  /**
   * Saves a refresh token associated with a user ID.
   * @param {number} userId - The user's ID.
   * @param {string} refreshToken - The refresh token to save.
   * @returns {Promise<void>}
   */
  async saveRefreshToken(userId, refreshToken) {
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)',
      [userId, refreshToken]
    );
  }

  /**
   * Checks if a given refresh token is valid for a specified user ID.
   * @param {number} userId - The ID of the user.
   * @param {string} refreshToken - The refresh token to validate.
   * @returns {Promise<boolean>} True if the token is valid, false otherwise.
   */
  async isRefreshTokenValid(userId, refreshToken) {
    const [rows] = await pool.query(
      'SELECT * FROM refresh_tokens WHERE user_id = ? AND token = ?',
      [userId, refreshToken]
    );

    return rows.length > 0;
  }
}
