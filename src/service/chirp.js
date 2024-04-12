import ChirpRepository from '../repository/chirp/mysql/index.js';
import {
  ErrForbiddenAccess,
  ErrInvalidMessage,
  ErrNotFound,
} from './errors/index.js';

export default class ChirpService {
  #chirpRepository;

  /**
   *
   * @param {Object} config
   * @param {ChirpRepository} config.chirpRepository
   */
  constructor({ chirpRepository }) {
    this.#chirpRepository = chirpRepository;
  }

  /**
   * Creates a new chirp with the given message by the specified user.
   * Validates the message length before saving and retrieves the chirp with author details.
   * @param {Object} user - The user creating the chirp.
   * @param {number} user.id - The ID of the user.
   * @param {string} message - The content of the chirp to be created.
   * @returns {Promise<Object>} A promise that resolves to the created chirp with author details.
   * @throws {ErrInvalidMessage} If the message is empty or does not meet length requirements.
   * @throws {ErrNotFound} If the created chirp cannot be retrieved.
   */
  async createChirp(user, message) {
    if (!message.trim()) {
      throw new ErrInvalidMessage('the message must not empty');
    }

    if (message.length < 10 || message.length > 250) {
      throw new ErrInvalidMessage(
        'the message should between 10 and 250 characters'
      );
    }

    const chirpId = await this.#chirpRepository.createChirp(user.id, message);
    const results = await this.#chirpRepository.getChirpWithAuthor(chirpId);

    if (results.length === 0) {
      throw new ErrNotFound('resource is not found');
    }

    const chirp = results[0];

    return {
      id: chirp.id,
      message: message,
      author: {
        id: chirp.user_id,
        name: chirp.name,
        email: chirp.email,
      },
      created_at: chirp.created_at,
      updated_at: chirp.updated_at,
    };
  }

  /**
   * Fetches the latest 100 chirps from all users.
   * @returns {Promise<Array>} A promise that resolves to an array of chirp objects with author details.
   */
  async getChirpList() {
    const chirps = await this.#chirpRepository.getChirps();
    return chirps.map((chirp) => ({
      id: chirp.id,
      message: chirp.message,
      author: {
        id: chirp.user_id,
        name: chirp.name,
        email: chirp.email,
      },
      created_at: chirp.created_at,
      updated_at: chirp.updated_at,
    }));
  }

  /**
   * Retrieves a single chirp by its ID, including author details.
   * @param {number} chirpId - The ID of the chirp to retrieve.
   * @returns {Promise<Object>} A promise that resolves to the chirp with author details.
   * @throws {ErrNotFound} If no chirp with the given ID is found.
   */
  async getOneChirp(chirpId) {
    const results = await this.#chirpRepository.getChirpWithAuthor(chirpId);

    if (results.length === 0) {
      throw new ErrNotFound('resource is not found');
    }

    const chirp = results[0];

    return {
      id: chirp.id,
      message: chirp.message,
      author: {
        id: chirp.user_id,
        name: chirp.name,
        email: chirp.email,
      },
      created_at: chirp.created_at,
      updated_at: chirp.updated_at,
    };
  }

  /**
   * Edits an existing chirp if the requesting user is the creator and returns the updated chirp.
   * @param {Object} user - The user requesting the edit.
   * @param {number} chirpId - The ID of the chirp to edit.
   * @param {string} message - The new message content for the chirp.
   * @returns {Promise<Object>} A promise that resolves with the updated chirp.
   * @throws {Error} Throws a 403 error if the user is not the creator.
   * @throws {Error} Throws a 404 error if the chirp does not exist.
   */
  async editChirp(user, chirpId, message) {
    const userId = user.id;

    if (!message.trim()) {
      throw new ErrInvalidMessage('the message must not empty');
    }

    if (message.length < 10 || message.length > 250) {
      throw new ErrInvalidMessage(
        'the message should between 10 and 250 characters'
      );
    }

    const userIsAuthor = await this.#chirpRepository.isUserTheAuthor(
      chirpId,
      userId
    );
    if (!userIsAuthor) {
      throw new ErrForbiddenAccess(
        "user don't have authorization to access this resource"
      );
    }

    await this.#chirpRepository.updateChirp(chirpId, userId, message);

    // After a successful update, fetch the updated chirp details
    const updatedChirpDetails = await this.#chirpRepository.getChirpWithAuthor(
      chirpId
    );
    if (updatedChirpDetails.length === 0) {
      // Maybe we can improve it in the future to inform that the chirp is successfully created but can't be fetch
      throw new ErrNotFound('resource is not found');
    }

    // Format and return the updated chirp details
    const updatedChirp = updatedChirpDetails[0];
    return {
      id: updatedChirp.id,
      message: updatedChirp.message,
      author: {
        id: updatedChirp.user_id,
        name: updatedChirp.name,
        email: updatedChirp.email,
      },
      created_at: updatedChirp.created_at,
      updated_at: updatedChirp.updated_at,
    };
  }

  // In ChirpService

  /**
   * Deletes a chirp if the user requesting the deletion is the creator.
   * @param {Object} user - The user requesting the deletion.
   * @param {number} chirpId - The ID of the chirp to be deleted.
   * @returns {Promise<void>} A promise that resolves if the deletion was successful.
   * @throws {Error} Throws an error if the chirp doesn't exist or the user is not authorized.
   */
  async deleteChirp(user, chirpId) {
    const userId = user.id;

    const chirpDetails =
      await this.#chirpRepository.checkChirpExistenceAndOwner(chirpId);
    if (!chirpDetails) {
      throw new ErrNotFound('resource is not found');
    }
    if (chirpDetails.user_id !== userId) {
      throw new ErrForbiddenAccess(
        "user don't have authorization to access this resource"
      );
    }

    await this.#chirpRepository.deleteChirp(chirpId, userId);
  }
}
