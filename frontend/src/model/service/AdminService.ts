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

  async getNetIdsForDeliverablePhase(phase: number) {
    return await this.serverFacade.getNetIdsForDeliverablePhase(phase);
  }

  async listAdmins() {
    return await this.serverFacade.listAdmins();
  }
}
