import { ServerFacade } from '../../network/ServerFacade';
import { Submission } from '../domain/Submission';
import { User } from '../domain/User';

export class AdminService {
  private serverFacade = new ServerFacade();

  async getStudentInfo(netid: string): Promise<[User, Submission[]]> {
    return this.serverFacade.getStudentInfo(netid);
  }
}
