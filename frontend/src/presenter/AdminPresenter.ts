import { Submission } from '../model/domain/Submission';
import { User } from '../model/domain/User';
import { GradeService } from '../model/service/GradeService';
import { UserService } from '../model/service/UserService';

export interface AdminView {
	setStudent: (student: User) => void;
	setSubmissions: (submissions: Submission[]) => void;
}

export class AdminPresenter {
	private view: AdminView;
	private userService;
	private gradeService;
	constructor(view: AdminView) {
		this.view = view;
		this.userService = new UserService();
		this.gradeService = new GradeService();
	}
	async getStudentInfo(netid: string) {
		const student = await this.userService.getUserInfo(netid);
		this.view.setStudent(student);
	}

	async getSubmissions(netid: string) {
		const submissions = await this.gradeService.getSubmissions(netid);
		this.view.setSubmissions(submissions);
	}
}
