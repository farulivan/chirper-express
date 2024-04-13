import HashRepository from '../../repository/auth/hash/bcrypt/index.js';
import TokenRepository from '../../repository/auth/token/jwt/index.js';
import SessionRepository from '../../repository/session/mysql/index.js';
import {
  ErrInvalidCreds,
  ErrInvalidEmail,
  ErrInvalidName,
  ErrInvalidPassword,
  ErrInvalidRefreshToken,
} from '../errors/index.js';
import SessionService from '../session';

jest.mock('../../repository/auth/token/jwt/index.js');
jest.mock('../../repository/session/mysql/index.js');
jest.mock('../../repository/auth/hash/bcrypt/index.js');

describe('SessionService', () => {
  let sessionService;
  let mockSessionRepo;
  let mockTokenRepo;
  let mockHashRepo;

  beforeEach(() => {
    mockSessionRepo = new SessionRepository();
    mockTokenRepo = new TokenRepository();
    mockHashRepo = new HashRepository();
    sessionService = new SessionService({
      sessionRepository: mockSessionRepo,
      tokenRepository: mockTokenRepo,
      hashRepository: mockHashRepo,
    });
  });

  describe('login', () => {
    const loginCases = [
      {
        name: 'should successful login and return session info',
        args: { email: 'user@example.com', password: 'correctPassword' },
        setup: () => {
          mockSessionRepo.getUser.mockResolvedValue({
            id: 1,
            name: 'user',
            email: 'user@example.com',
            password: 'hashedPassword',
          });
          mockHashRepo.comparePassword.mockResolvedValue(true);
          mockTokenRepo.generateAccessToken.mockReturnValue('access-token');
          mockTokenRepo.generateRefreshToken.mockReturnValue('refresh-token');
        },
        expectedOutput: {
          id: 1,
          email: 'user@example.com',
          name: 'user',
          access_token: 'access-token',
          refresh_token: 'refresh-token',
        },
        expectedError: null,
      },
      {
        name: 'should throw ErrInvalidEmail if email format is incorrect',
        args: { email: 'invalidEmail', password: 'password123' },
        expectedError: ErrInvalidEmail,
      },
      {
        name: 'should throw ErrInvalidPassword if password length is too short',
        args: { email: 'user@example.com', password: 'short' },
        expectedError: ErrInvalidPassword,
      },
      {
        name: 'should throw ErrInvalidCreds if user not found',
        args: { email: 'user@example.com', password: 'validPassword123' },
        setup: () => mockSessionRepo.getUser.mockResolvedValue(null),
        expectedError: ErrInvalidCreds,
      },
      {
        name: 'should throw ErrInvalidCreds if password is incorrect',
        args: { email: 'user@example.com', password: 'wrongPassword' },
        setup: () => {
          mockSessionRepo.getUser.mockResolvedValue({
            id: 1,
            email: 'user@example.com',
            password: 'hashedCorrectPassword',
          });
          mockHashRepo.comparePassword.mockResolvedValue(false);
        },
        expectedError: ErrInvalidCreds,
      },
    ];

    loginCases.forEach(
      ({ name, args, setup, expectedError, expectedOutput }) => {
        it(name, async () => {
          if (setup) setup();
          if (expectedError) {
            await expect(
              sessionService.login(args.email, args.password)
            ).rejects.toThrow(expectedError);
          } else {
            const result = await sessionService.login(
              args.email,
              args.password
            );
            expect(result).toEqual(expectedOutput);
          }
        });
      }
    );
  });

  describe('register', () => {
    const registrationCases = [
      {
        name: 'should register a new user and return user info',
        args: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'validPassword123',
        },
        setup: () => {
          mockSessionRepo.createUser.mockResolvedValue({
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
          });
        },
        expectedOutput: {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
        expectedError: null,
      },
      {
        name: 'should throw ErrInvalidEmail if email format is incorrect',
        args: { name: 'John Doe', email: 'john.doe', password: 'password123' },
        setup: () => {
          mockSessionRepo.createUser.mockRejectedValue(new ErrInvalidEmail());
        },
        expectedError: ErrInvalidEmail,
      },
      {
        name: 'should throw ErrInvalidName if name is too short',
        args: {
          name: 'Jo',
          email: 'john.doe@example.com',
          password: 'password123',
        },
        setup: () => {
          mockSessionRepo.createUser.mockRejectedValue(new ErrInvalidEmail());
        },
        expectedError: ErrInvalidName,
      },
      {
        name: 'should throw ErrInvalidPassword if password length is too short',
        args: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'short',
        },
        setup: () => {
          mockSessionRepo.createUser.mockRejectedValue(new ErrInvalidEmail());
        },
        expectedError: ErrInvalidPassword,
      },
    ];

    registrationCases.forEach(
      ({ name, args, setup, expectedError, expectedOutput }) => {
        it(name, async () => {
          if (setup) setup();
          if (expectedError) {
            await expect(
              sessionService.register(args.name, args.email, args.password)
            ).rejects.toThrow(expectedError);
          } else {
            const result = await sessionService.register(
              args.name,
              args.email,
              args.password
            );
            expect(result).toEqual(expectedOutput);
          }
        });
      }
    );
  });

  describe('getNewAccessToken', () => {
    const accessTokenTestCases = [
      {
        name: 'should validates and returns a new access token for valid refresh token',
        refreshToken: 'valid-refresh-token',
        setup: () => {
          mockTokenRepo.verifyRefreshToken.mockResolvedValue({
            id: 1,
            email: 'user@example.com',
          });
          mockSessionRepo.isRefreshTokenValid.mockResolvedValue(true);
          mockTokenRepo.generateAccessToken.mockReturnValue('new-access-token');
        },
        expected: 'new-access-token',
        expectedError: null,
      },
      {
        name: 'should throws ErrInvalidRefreshToken if the refresh token is invalid',
        refreshToken: 'invalidToken',
        setup: () => {
          mockTokenRepo.verifyRefreshToken.mockRejectedValue(
            new ErrInvalidRefreshToken('invalid refresh token')
          );
        },
        expected: null,
        expectedError: ErrInvalidRefreshToken,
      },
      {
        name: 'should throws ErrInvalidRefreshToken if the refresh token is not valid in the database',
        refreshToken: 'validFormatToken-but-invalid',
        setup: () => {
          mockTokenRepo.verifyRefreshToken.mockResolvedValue({
            id: 1,
            email: 'user@example.com',
          });
          mockSessionRepo.isRefreshTokenValid.mockResolvedValue(false);
        },
        expected: null,
        expectedError: ErrInvalidRefreshToken,
      },
    ];

    accessTokenTestCases.forEach(
      ({ name, refreshToken, setup, expected, expectedError }) => {
        it(name, async () => {
          if (setup) setup();
          if (expectedError) {
            await expect(
              sessionService.getNewAccessToken(refreshToken)
            ).rejects.toThrow(expectedError);
          } else {
            const accessToken = await sessionService.getNewAccessToken(
              refreshToken
            );
            expect(accessToken).toEqual(expected);
          }
        });
      }
    );
  });
});
