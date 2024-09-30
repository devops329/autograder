import { GradeService } from '../model/service/GradeService';

export interface StatsView {
  setStats(stats: object): void;
  setError(error: string): void;
}

export class StatsPresenter {
  private view: StatsView;
  private gradeService: GradeService;
  constructor(view: StatsView) {
    this.view = view;
    this.gradeService = new GradeService();
  }

  async getStats() {
    let stats: object = {};
    try {
      stats = await this.gradeService.getStats();
    } catch (e) {
      this.view.setError((e as Error).message);
    }
    this.view.setStats(stats);
  }
}
