import { ServerFacade } from '../../network/ServerFacade';
import { Submission } from '../domain/Submission';
import { User } from '../domain/User';

export class UserService {
  private serverFacade = new ServerFacade();

  async login(): Promise<[User, Submission[]]> {
    return this.serverFacade.login();
  }

  async logout(): Promise<string> {
    return this.serverFacade.logout();
  }

  async getUserInfo(): Promise<[User, Submission[]]> {
    return this.serverFacade.getUserInfo();
  }

  async updateUserInfo(website: string, github: string, email: string): Promise<User> {
    return this.serverFacade.updateUserInfo(website, github, email);
  }
}
