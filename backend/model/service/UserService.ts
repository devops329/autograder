import { DB } from '../dao/mysql/Database';
import { User } from '../domain/User';

export class UserService {
  private dao: DB;

  constructor(dao: DB) {
    this.dao = dao;
  }

  async login() {
    const user = new User(1, 'Fake User', 'fakeNetId', '123456-abcdef-123456-abcdef', true);
    await this.dao.putUser(user);
    return user;
  }

  async getUser(netId: string) {
    return await this.dao.getUser(netId);
  }
}
