import { AdminService } from '../model/service/AdminService';

export interface AdminView {
  setSubmissionsEnabled(submissionsEnabled: boolean): void;
}

export class AdminPresenter {
  private adminService: AdminService;
  private view: AdminView;
  constructor(view: AdminView) {
    this.view = view;
    this.adminService = new AdminService();
  }
  async toggleSemesterOver() {
    const submissionsEnabled = await this.adminService.toggleSemesterOver();
    this.view.setSubmissionsEnabled(submissionsEnabled);
  }
}
