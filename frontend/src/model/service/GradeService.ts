import { ServerFacade } from '../../network/ServerFacade';

export class GradeService {
  readonly _assignmentPhases: number[] = [1, 2, 3, 4, 5, 6, 9, 10, 11];

  get assignmentPhases(): number[] {
    return this._assignmentPhases;
  }

  private serverFacade: ServerFacade = new ServerFacade();
  async grade(netId: string, assignmentPhase: number) {
    const submissions = await this.serverFacade.grade(netId, assignmentPhase);
    return submissions;
  }
}
