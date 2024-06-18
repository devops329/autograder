import { ServerFacade } from '../../network/ServerFacade';

export class GradeService {
  readonly _assignmentPhases: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  get assignmentPhases(): number[] {
    return this._assignmentPhases;
  }

  private serverFacade: ServerFacade = new ServerFacade();
  async grade(assignmentPhase: number) {
    const submissions = await this.serverFacade.grade(assignmentPhase);
    return submissions;
  }
}
