import { Submission } from '../model/domain/Submission';
import { GradeService } from '../model/service/GradeService';

export interface GradeView {
	setGrade(grade: number): void;
	setError(error: string): void;
	setSubmissions(submissions: Submission[]): void;
}

export class GradePresenter {
	private view: GradeView;
	private gradeService: GradeService;
	constructor(view: GradeView) {
		this.view = view;
		this.gradeService = new GradeService();
	}
	async doGrade(assignmentPhase: number) {
		let submissions: Submission[] = [];
		try {
			submissions = await this.gradeService.grade(assignmentPhase);
		} catch (e) {
			this.view.setError((e as Error).message);
		}
		this.view.setSubmissions(submissions);
		localStorage.setItem('submissions', JSON.stringify(submissions));
		this.view.setGrade(submissions[submissions.length - 1].score);
	}

	get assignmentPhases(): number[] {
		return this.gradeService.assignmentPhases;
	}
}
