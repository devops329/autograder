import { AdminService } from '../model/service/AdminService';

export interface StatsView {
  setStats(stats: object): void;
  setError(error: string): void;
}

export class StatsPresenter {
  private view: StatsView;
  private adminService: AdminService;
  constructor(view: StatsView) {
    this.view = view;
    this.adminService = new AdminService();
  }

  async getStats() {
    let stats: object = {};
    try {
      stats = await this.adminService.getStats();
    } catch (e) {
      this.view.setError((e as Error).message);
    }
    this.view.setStats(stats);
  }

  async getNetIdsForDeliverablePhase(phase: number) {
    let netIds: string[] = [];
    try {
      netIds = await this.adminService.getNetIdsForDeliverablePhase(phase);
      return netIds;
    } catch (e) {
      this.view.setError((e as Error).message);
    }
  }
}
