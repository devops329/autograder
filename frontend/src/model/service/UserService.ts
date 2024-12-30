import { ServerFacade } from '../../network/ServerFacade';
import { Submission } from '../domain/Submission';
import { User } from '../domain/User';

export class UserService {
  private serverFacade = new ServerFacade();

  async getUserInfo(netId?: string): Promise<[User, Submission[]] | null> {
    return this.serverFacade.getUserInfo(netId);
  }

  async impersonateUser(searchString: string): Promise<[User, Submission[]] | null> {
    return this.serverFacade.impersonateUser(searchString);
  }

  async updateUserInfo(netId: string, website: string, github: string, email: string, graceDays: number): Promise<User> {
    return this.serverFacade.updateUserInfo(netId, website, github, email, graceDays);
  }

  async logOut(): Promise<void> {
    return this.serverFacade.logOut();
  }
}
