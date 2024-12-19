import { AdminService } from '../model/service/AdminService';

export interface AdminView {
  setSemesterOver(semesterOver: boolean): void;
}

export class AdminPresenter {
  private adminService: AdminService;
  private view: AdminView;
  constructor(view: AdminView) {
    this.view = view;
    this.adminService = new AdminService();
  }
  async toggleSemesterOver() {
    const semesterOver = await this.adminService.toggleSemesterOver();
    this.view.setSemesterOver(semesterOver);
  }
}
