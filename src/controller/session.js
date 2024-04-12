import { ErrInvalidRefreshToken } from '../service/errors/index.js';
import SessionService from '../service/session.js';

export default class SessionController {
  #sessionService;

  /**
   *
   * @param {SessionService} config.sessionService
   */
  constructor({ sessionService }) {
    this.#sessionService = sessionService;
  }

  async loginHandler(req, res, next) {
    const { email, password } = req.body;

    try {
      const result = await this.#sessionService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async registerHandler(req, res, next) {
    const { name, email, password } = req.body;

    try {
      const user = await this.#sessionService.register(name, email, password);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async refreshTokenHandler(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const refreshToken = authHeader && authHeader.split(' ')[1]; // Bearer Token

      if (!refreshToken) {
        throw new ErrInvalidRefreshToken('invalid refresh token');
      }

      const accessToken = await this.#sessionService.getNewAccessToken(
        refreshToken
      );

      res.json({
        access_token: accessToken,
      });
    } catch (error) {
      next(error);
    }
  }
}
