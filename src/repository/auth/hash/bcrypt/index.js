import bcrypt from 'bcrypt';

/**
 * Class responsible for password hashing and comparison.
 * Utilizes bcrypt to securely manage passwords.
 */
export default class HashRepository {
  /**
   * Creates an instance of HashRepository.
   * @param {Object} config Configuration options for the HashRepository.
   * @param {number} [config.saltRounds=10] The number of rounds to use when generating a salt for password hashing. Higher values increase security but also increase processing time.
   */
  constructor({ saltRounds = 10 }) {
    this.saltRounds = saltRounds;
  }

  /**
   * Hashes a password using bcrypt with predefined salt rounds.
   * @param {string} password The plain text password to hash.
   * @returns {Promise<string>} A promise that resolves to the hashed password.
   */
  async hashPassword(password) {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compares a plain text password with a hashed password.
   * @param {string} password The plain text password.
   * @param {string} hash The hash to compare against.
   * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, false otherwise.
   */
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
}
