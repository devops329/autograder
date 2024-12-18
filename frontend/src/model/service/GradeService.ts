import { ServerFacade } from '../../network/ServerFacade';

export class GradeService {
  readonly _assignmentPhases: number[] = [1, 2, 3, 4, 5, 6, 7, 11, 12];

  get assignmentPhases(): number[] {
    return this._assignmentPhases;
  }

  private serverFacade: ServerFacade = new ServerFacade();
  async grade(netId: string, assignmentPhase: number) {
    return await this.serverFacade.grade(netId, assignmentPhase);
  }

  async getStats() {
    return await this.serverFacade.getStats();
  }

  async getNetIdsForDeliverablePhase(phase: number) {
    return await this.serverFacade.getNetIdsForDeliverablePhase(phase);
  }

  async toggleSemesterOver() {
    return await this.serverFacade.toggleSemesterOver();
  }
}
