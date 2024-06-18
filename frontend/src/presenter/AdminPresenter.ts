import { Submission } from '../model/domain/Submission';
import { User } from '../model/domain/User';
import { AdminService } from '../model/service/AdminService';

export interface AdminView {
  setStudent: (student: User) => void;
  setSubmissions: (submissions: Submission[]) => void;
}

export class AdminPresenter {
  private view: AdminView;
  private adminService;
  constructor(view: AdminView) {
    this.view = view;
    this.adminService = new AdminService();
  }
  async getStudentInfo(netid: string) {
    const [student, submissions] = await this.adminService.getStudentInfo(netid);
    this.view.setStudent(student);
    this.view.setSubmissions(submissions);
  }
}
