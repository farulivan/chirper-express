import express from 'express';
import SessionRepository from './repository/session/mysql/index.js';
import TokenRepository from './repository/auth/token/jwt/index.js';
import SessionService from './service/session.js';
import SessionController from './controller/session.js';
import authenticateToken from './middleware/authenticateToken.js';
import ChirpController from './controller/chirp.js';
import ChirpService from './service/chirp.js';
import ChirpRepository from './repository/chirp/mysql/index.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import HashRepository from './repository/auth/hash/bcrypt/index.js';

const tokenRepository = new TokenRepository({
  accessTokenSecret: 'secret',
  refreshTokenSecret: 'supersecret',
});

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
const hashRepository = new HashRepository({
  saltRounds,
});

const sessionRepository = new SessionRepository();
const sessionService = new SessionService({
  sessionRepository,
  tokenRepository,
  hashRepository,
});
const sessionController = new SessionController({ sessionService });

const chirpRepository = new ChirpRepository();
const chirpService = new ChirpService({ chirpRepository });
const chirpController = new ChirpController({ chirpService });

const app = express();

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.use(express.json());

app.post('/api/session', async (...args) => {
  sessionController.loginHandler(...args);
});

app.post('/api/users', async (...args) => {
  sessionController.registerHandler(...args);
});

app.put('/api/session', async (...args) => {
  sessionController.refreshTokenHandler(...args);
});

app.use(authenticateToken(tokenRepository));

app.post('/api/chirps', async (...args) => {
  chirpController.createChirpHandler(...args);
});

app.get('/api/chirps', async (...args) => {
  chirpController.getChirpListHandler(...args);
});

app.get('/api/chirps/:chirp_id', async (...args) => {
  chirpController.getOneChirpHandler(...args);
});

app.put('/api/chirps/:chirp_id', async (...args) => {
  chirpController.editChirpHandler(...args);
});

app.delete('/api/chirps/:chirp_id', async (...args) => {
  chirpController.deleteChirpHandler(...args);
});

app.use(errorMiddleware);

app.listen(3000);
