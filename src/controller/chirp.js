export default class ChirpController {
  #chirpService;

  constructor({ chirpService }) {
    this.#chirpService = chirpService;
  }

  /**
   * Handles the creation of a new chirp. Extracts user information and message content
   * from the request body and delegates to the ChirpService for creation.
   *
   * @param {Object} req - The request object.
   * @param {Object} req.user - The user making the request.
   * @param {string} req.body.message - The message content of the chirp to be created.
   * @param {Object} res - The response object.
   * @param {function} next - The next middleware function in the express middleware chain.
   * @returns {Promise<void>} A promise that resolves with no value.
   */
  async createChirpHandler(req, res, next) {
    try {
      const { user } = req;
      const { message } = req.body;
      const chirp = await this.#chirpService.createChirp(user, message);

      res.status(200).json(chirp);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles fetching the list of latest chirps from all users.
   * @param {Object} req - The HTTP request object.
   * @param {Object} res - The HTTP response object.
   * @param {function} next - The next middleware function in the chain.
   * @returns {Promise<void>} A promise that resolves with no value.
   */
  async getChirpListHandler(req, res, next) {
    try {
      const chirps = await this.#chirpService.getChirpList();
      res.status(200).json(chirps);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves the details of a single chirp specified by the chirp ID in the request parameters.
   * Delegates to the ChirpService to fetch the chirp details.
   *
   * @param {Object} req - The request object.
   * @param {string} req.params.chirp_id - The ID of the chirp to retrieve.
   * @param {Object} res - The response object.
   * @param {function} next - The next middleware function in the express middleware chain.
   * @returns {Promise<void>} A promise that resolves with no value.
   */
  async getOneChirpHandler(req, res, next) {
    try {
      // params is string
      const chirpId = req.params['chirp_id'];

      const chirp = await this.#chirpService.getOneChirp(chirpId);
      res.status(200).json(chirp);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles the request to edit an existing chirp. Verifies that the user making the request
   * is the creator of the chirp before proceeding with the edit.
   *
   * @param {Object} req - The request object.
   * @param {number} req.user.id - The ID of the user making the request.
   * @param {string} req.params.chirp_id - The ID of the chirp to be edited.
   * @param {string} req.body.message - The new message content for the chirp.
   * @param {Object} res - The response object.
   * @param {function} next - The next middleware function in the express middleware chain.
   * @returns {Promise<void>} A promise that resolves with no value.
   */
  async editChirpHandler(req, res, next) {
    try {
      const { user } = req;
      const { message } = req.body;
      const chirpId = req.params['chirp_id'];

      const chirp = await this.#chirpService.editChirp(user, chirpId, message);

      res.status(200).json(chirp);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles the request to delete a chirp.
   * @param {Object} req - The request object.
   * @param {number} req.params.chirp_id - The ID of the chirp to be deleted.
   * @param {Object} res - The response object.
   * @param {function} next - The next middleware function in the chain.
   * @returns {Promise<void>} A promise that resolves with no value.
   */
  async deleteChirpHandler(req, res, next) {
    try {
      const { user } = req;
      const chirpId = req.params['chirp_id'];

      await this.#chirpService.deleteChirp(user, chirpId);
      res.status(200).json({ id: chirpId });
    } catch (error) {
      next(error);
    }
  }
}
