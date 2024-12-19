import { ServerFacade } from '../../network/ServerFacade';

export class AdminService {
  private serverFacade: ServerFacade = new ServerFacade();

  async toggleSemesterOver() {
    return await this.serverFacade.toggleSemesterOver();
  }
}
