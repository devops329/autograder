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
  async toggleSubmissionsEnabled() {
    const submissionsEnabled = await this.adminService.toggleSubmissionsEnabled();
    localStorage.setItem('submissionsEnabled', submissionsEnabled ? 'true' : 'false');
    this.view.setSubmissionsEnabled(submissionsEnabled);
  }

  async getSubmissionsEnabled() {
    const submissionsEnabled = await this.adminService.getSubmissionsEnabled();
    localStorage.setItem('submissionsEnabled', submissionsEnabled ? 'true' : 'false');
    this.view.setSubmissionsEnabled(submissionsEnabled);
  }
}
