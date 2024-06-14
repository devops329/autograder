import { DB } from '../dao/mysql/Database';
import { PizzaFactory } from '../dao/pizzaFactory/PizzaFactory';
import { User } from '../domain/User';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  private dao: DB;
  private pizzaFactory: PizzaFactory;

  constructor(dao: DB, pizzaFactory: PizzaFactory) {
    this.dao = dao;
    this.pizzaFactory = pizzaFactory;
  }

  async login() {
    const netid = 'fakeNetId';
    let token = await this.dao.getToken(netid);
    if (!token) {
      token = uuidv4();
      this.dao.putToken(token, netid);
    } else {
      console.log('Token already exists');
    }

    let user = await this.dao.getUser(netid);
    if (user) {
      console.log('User already exists');
      return { user, token, firstTime: false };
    } else {
      const apiKey = await this.pizzaFactory.getApiKey(netid, 'Fake User');
      user = new User(1, 'Fake User', netid, apiKey, '', '', true);
      await this.dao.putUser(user);
      return { user, token, firstTime: true };
    }
  }

  async logout(token: string) {
    await this.dao.deleteToken(token);
  }

  async getUser(netId: string) {
    return await this.dao.getUser(netId);
  }

  async updateUserWebsiteAndGithub(netId: string, website: string, github: string) {
    await this.dao.updateUserWebsiteAndGithub(netId, website, github);
    return await this.getUser(netId);
  }
}
