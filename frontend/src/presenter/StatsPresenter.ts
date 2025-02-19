import { DeliverableStat } from '../model/domain/DeliverableStat';
import { AdminService } from '../model/service/AdminService';

export interface StatsView {
  setStats(stats: Map<number, DeliverableStat> | null): void;
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
    try {
      this.view.setStats(await this.adminService.getStats());
    } catch (e) {
      this.view.setError((e as Error).message);
    }
  }
}
