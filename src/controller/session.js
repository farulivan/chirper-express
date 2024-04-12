import { ErrInvalidRefreshToken } from '../service/errors/index.js';
import SessionService from '../service/session.js';

/**
 * Controller responsible for handling session-related actions such as user login,
 * registration, and token refresh operations.
 */
export default class SessionController {
  #sessionService;

  /**
   * Constructs a session controller with dependencies.
   * @param {Object} config Configuration object for the session controller.
   * @param {SessionService} config.sessionService The session service to handle business logic related to user sessions.
   */
  constructor({ sessionService }) {
    this.#sessionService = sessionService;
  }

  /**
   * Handles user login requests.
   * @param {Object} req The HTTP request object, containing user credentials in the body.
   * @param {Object} res The HTTP response object used to respond to the client.
   * @param {function} next The next middleware to handle errors.
   * @returns {Promise<void>} A promise that resolves when the response is sent.
   */
  async loginHandler(req, res, next) {
    const { email, password } = req.body;

    try {
      const result = await this.#sessionService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles user registration requests.
   * @param {Object} req The HTTP request object, containing new user details in the body.
   * @param {Object} res The HTTP response object used to respond to the client.
   * @param {function} next The next middleware to handle errors.
   * @returns {Promise<void>} A promise that resolves when the response is sent.
   */
  async registerHandler(req, res, next) {
    const { name, email, password } = req.body;

    try {
      const user = await this.#sessionService.register(name, email, password);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles requests to refresh an access token using a refresh token.
   * @param {Object} req The HTTP request object, containing the refresh token in the authorization header.
   * @param {Object} res The HTTP response object used to respond to the client with a new access token.
   * @param {function} next The next middleware to handle errors.
   * @returns {Promise<void>} A promise that resolves when the response is sent.
   */
  async refreshTokenHandler(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const refreshToken = authHeader && authHeader.split(' ')[1]; // Extract token from Bearer string

      if (!refreshToken) {
        throw new ErrInvalidRefreshToken('invalid refresh token');
      }

      const accessToken = await this.#sessionService.getNewAccessToken(
        refreshToken
      );
      res.json({ access_token: accessToken });
    } catch (error) {
      next(error);
    }
  }
}
