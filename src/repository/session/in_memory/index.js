import {
  ErrEmailAlreadyRegistered,
  ErrInvalidCreds,
} from '../../../service/errors/index.js';
import bcrypt from 'bcrypt';

const users = [
  {
    id: 1,
    email: 'ahmad.sadeli@mail.com',
    name: 'Ahmad Sadeli',
    hashedPassword:
      '$2b$10$vXJl7.nmgHOT41QmEjVt9.PRfAyBhHNq/kmsyYiTHsvFYKL.bZcfe',
  },
];

export default class SessionRepository {
  async getValidUser(email, password) {
    const user = users.find((user) => user.email === email);

    if (!user) {
      throw new ErrInvalidCreds('incorrect email or password');
    }

    const match = await bcrypt.compare(password, user.hashedPassword);

    if (!match) {
      throw new ErrInvalidCreds('incorrect email or password');
    }

    return user;
  }

  async createUser(name, email, password) {
    const userAlreadyRegistered = users.find((user) => user.email === email);

    if (userAlreadyRegistered) {
      throw new ErrEmailAlreadyRegistered('given email is already registered');
    }

    users.push({ name, email, password });

    return { name, email, password };
  }
}
