import { User } from '../model/domain/User';
import { AdminService } from '../model/service/AdminService';

export interface AdminView {
  setSubmissionsEnabled(submissionsEnabled: boolean): void;
  setAdmins(admins: User[]): void;
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

  async toggleAdminList(admins: User[]) {
    if (admins.length > 0) {
      this.view.setAdmins([]);
      return;
    }
    admins = (await this.adminService.listAdmins()) ?? [];
    if (!admins) {
      return;
    }
    this.view.setAdmins(admins);
  }
}
