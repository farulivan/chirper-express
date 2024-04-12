import SessionService from './session.js';
class MockSessionRepository {
  getValidUser(email, password) {
    if (email !== 'farulivan@gmail.com') {
      throw new Error('Invalid Email or Password');
    }

    if (password !== 1234) {
      throw new Error('Invalid Email or Password');
    }

    return {
      id: 1,
      email: 'farulivan@gmail.com',
      name: 'Farul Ivan',
    };
  }
}

class MockTokenRepository {
  generateAccessToken(userId, email, expiresIn) {
    return 'thisistokenexample';
  }

  generateRefreshToken(userId, email) {
    return 'thisisrefreshtokenexample';
  }
}

const sessionRepository = new MockSessionRepository();
const tokenRepository = new MockTokenRepository();
const sessionService = new SessionService({ sessionRepository, tokenRepository });

test('Adding Number', () => {
  const result = sessionService.addNumber(1, 2);

  expect(result).toEqual(3);
});

test('Login', () => {
  const result = sessionService.login('farulivan@gmail.com', 1234);

  expect(result).toEqual({
    id: 1,
    email: 'farulivan@gmail.com',
    name: 'Farul Ivan',
    access_token: 'thisistokenexample',
    refresh_token: 'thisisrefreshtokenexample',
  });
});
