import { ServerFacade } from '../../network/ServerFacade';

export class AdminService {
  private serverFacade: ServerFacade = new ServerFacade();

  async toggleSubmissionsEnabled() {
    return await this.serverFacade.toggleSubmissionsEnabled();
  }

  async getSubmissionsEnabled() {
    return await this.serverFacade.getSubmissionsEnabled();
  }

  async getStats() {
    return await this.serverFacade.getStats();
  }

  async listAdmins() {
    return await this.serverFacade.listAdmins();
  }

  async removeAdmin(netId: string) {
    return await this.serverFacade.removeAdmin(netId);
  }

  async addAdmin(netId: string) {
    return await this.serverFacade.addAdmin(netId);
  }

  async dropStudentData() {
    return await this.serverFacade.dropStudentData();
  }

  async restoreStudentData() {
    return await this.serverFacade.restoreStudentData();
  }
}
