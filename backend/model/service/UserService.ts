import { Canvas } from '../dao/canvas/Canvas';
import { DB } from '../dao/mysql/Database';
import { PizzaFactory } from '../dao/pizzaFactory/PizzaFactory';
import { User } from '../domain/User';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  private dao: DB;
  private pizzaFactory: PizzaFactory;
  private canvas: Canvas;

  constructor(dao: DB, pizzaFactory: PizzaFactory, canvas: Canvas) {
    this.dao = dao;
    this.pizzaFactory = pizzaFactory;
    this.canvas = canvas;
  }

  async login(netid: string) {
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
      return token;
    } else {
      const studentInfo = await this.canvas.getStudentInfo(netid);
      console.log('Student info:', studentInfo);
      let name = '';
      let email = '';
      try {
        email = studentInfo.email;
        name = studentInfo.short_name;
      } catch (e) {
        name = 'See TA to update name';
      }
      const apiKey = await this.pizzaFactory.getApiKey(netid, name);
      user = new User(name, netid, apiKey, '', '', email, false);
      await this.dao.putUser(user);
      return token;
    }
  }

  async logout(token: string) {
    await this.dao.deleteToken(token);
  }

  async getUser(netId: string) {
    return await this.dao.getUser(netId);
  }

  async updateUserInfo(netId: string, website: string, github: string, email: string) {
    await this.dao.updateUserInfo(netId, website, github, email);
    return await this.getUser(netId);
  }
}
