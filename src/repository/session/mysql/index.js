import pool from '../../../database/database.js';
import {
  ErrEmailAlreadyRegistered,
  ErrInternalServer,
} from '../../../service/errors/index.js';

export default class SessionRepository {
  async getUser(email) {
    // Get user by email
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    if (rows.length === 0) {
      return null; // Return null to indicate no user found
    }

    const user = rows[0];
    return user;
  }

  async createUser(name, email, hashedPassword) {
    try {
      // Attempt to insert the new user into the database
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
      throw new ErrInternalServer(error);
    }
  }

  async saveRefreshToken(userId, refreshToken) {
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)',
      [userId, refreshToken]
    );
  }

  async isRefreshTokenValid(userId, refreshToken) {
    const [rows] = await pool.query(
      'SELECT * FROM refresh_tokens WHERE user_id = ? AND token = ?',
      [userId, refreshToken]
    );

    if (rows.length === 0) {
      // Token not found or not valid
      return false;
    }

    // Token found and valid
    return true;
  }
}
