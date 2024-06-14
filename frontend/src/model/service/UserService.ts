import { ServerFacade } from '../../network/ServerFacade';
import { Submission } from '../domain/Submission';
import { User } from '../domain/User';

export class UserService {
  private serverFacade = new ServerFacade();

  async login(): Promise<[User, Submission[], boolean]> {
    return this.serverFacade.login();
  }

  async logout(): Promise<string> {
    return this.serverFacade.logout();
  }

  async getUserInfo(netId: string): Promise<User> {
    return this.serverFacade.getUserInfo(netId);
  }

  async updateUserInfo(website: string, github: string): Promise<User> {
    return this.serverFacade.updateUserInfo(website, github);
  }
}
