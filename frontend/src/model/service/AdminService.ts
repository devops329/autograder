import { ServerFacade } from '../../network/ServerFacade';

export class AdminService {
  private serverFacade: ServerFacade = new ServerFacade();

  async toggleSubmissionsEnabled() {
    return await this.serverFacade.toggleSubmissionsEnabled();
  }

  async getSubmissionsEnabled() {
    return await this.serverFacade.getSubmissionsEnabled();
  }
}
