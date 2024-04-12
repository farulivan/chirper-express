import pool from '../../../database/database.js';

/**
 * Repository for managing Chirps.
 * Provides functionalities to interact with chirps in the database.
 */
export default class ChirpRepository {
  /**
   * Creates a new chirp in the database.
   *
   * @param {number} userId - The ID of the user creating the chirp.
   * @param {string} message - The message content of the chirp.
   * @returns {Promise<number>} The ID of the newly created chirp.
   */
  async createChirp(userId, message) {
    const [result] = await pool.query(
      'INSERT INTO chirps (user_id, message, created_at, updated_at) VALUES (?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())',
      [userId, message]
    );

    return result.insertId;
  }

  /**
   * Retrieves a list of the latest 100 chirps along with their author's details from the database.
   * @returns {Promise<Array>} A promise that resolves to an array of chirp objects with author details.
   */
  async getChirps() {
    const [results] = await pool.query(
      `SELECT c.id, c.message, c.created_at, c.updated_at, u.id AS user_id, u.name, u.email
       FROM chirps c
       JOIN users u ON c.user_id = u.id
       ORDER BY c.created_at DESC
       LIMIT 100`
    );
    return results;
  }

  /**
   * Retrieves a chirp along with its author's details from the database.
   * This method returns the query result, which could be an empty array if no matching chirp is found.
   * It is the service responsibility to handle cases where no chirp is found.
   *
   * @param {number} chirpId - The ID of the chirp to retrieve.
   * @returns {Promise<Array>} An array containing the chirp and author details. The array is empty if no chirp is found.
   */
  async getChirpWithAuthor(chirpId) {
    const [result] = await pool.query(
      `
        SELECT c.id, c.message, c.created_at, c.updated_at, u.id AS user_id, u.name, u.email
        FROM chirps c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `,
      [chirpId]
    );

    return result;
  }

  /**
   * Checks if a chirp exists and if the specified user is its author.
   * @param {number} chirpId - The ID of the chirp.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<boolean>} A promise that resolves to true if the user is the author, false otherwise.
   */
  async isUserTheAuthor(chirpId, userId) {
    const [result] = await pool.query(
      'SELECT COUNT(*) AS count FROM chirps WHERE id = ? AND user_id = ?',
      [chirpId, userId]
    );
    return result[0].count > 0;
  }

  /**
   * Updates the message of an existing chirp.
   * @param {number} chirpId - The ID of the chirp to update.
   * @param {number} userId - The ID of the user requesting the update.
   * @param {string} message - The new message content for the chirp.
   * @returns {Promise<boolean>} A promise that resolves to true if the update was successful, false otherwise.
   */
  async updateChirp(chirpId, userId, message) {
    const [result] = await pool.query(
      'UPDATE chirps SET message = ?, updated_at = UNIX_TIMESTAMP() WHERE id = ? AND user_id = ?',
      [message, chirpId, userId]
    );

    return result.affectedRows === 1;
  }

  /**
   * Retrieves minimal details of a chirp to check existence and ownership.
   * @param {number} chirpId - The ID of the chirp.
   * @returns {Promise<Object|null>} A promise that resolves to the chirp details if found, or null if not.
   */
  async checkChirpExistenceAndOwner(chirpId) {
    const [result] = await pool.query(
      'SELECT id, user_id FROM chirps WHERE id = ?',
      [chirpId]
    );
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Deletes a chirp by its ID if the user requesting the delete is the author.
   * @param {number} chirpId - The ID of the chirp to delete.
   * @param {number} userId - The ID of the user attempting to delete the chirp.
   * @returns {Promise<boolean>} A promise that resolves to true if the deletion was successful, false otherwise.
   */
  async deleteChirp(chirpId, userId) {
    const [result] = await pool.query(
      'DELETE FROM chirps WHERE id = ? AND user_id = ?',
      [chirpId, userId]
    );
    return result.affectedRows === 1;
  }
}
