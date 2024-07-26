import { ServerFacade } from '../../network/ServerFacade';
import { Submission } from '../domain/Submission';
import { User } from '../domain/User';

export class UserService {
  private serverFacade = new ServerFacade();

  async getUserInfo(netId?: string): Promise<[User, Submission[]]> {
    return this.serverFacade.getUserInfo(netId);
  }

  async updateUserInfo(netId: string, website: string, github: string, email: string): Promise<User> {
    return this.serverFacade.updateUserInfo(netId, website, github, email);
  }
}
