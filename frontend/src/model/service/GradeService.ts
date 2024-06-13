import { ServerFacade } from '../../network/ServerFacade';

export class GradeService {
	readonly _assignmentPhases: number[] = [1, 2, 3, 4, 5, 6];

	get assignmentPhases(): number[] {
		return this._assignmentPhases;
	}

	private serverFacade: ServerFacade = new ServerFacade();
	async grade(assignmentPhase: number) {
		const submissions = await this.serverFacade.grade(assignmentPhase);
		return submissions;
	}

	async getSubmissions(netId: string) {
		const submissions = await this.serverFacade.getSubmissions(netId);
		return submissions;
	}
}
