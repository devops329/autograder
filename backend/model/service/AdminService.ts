import { DB } from '../dao/mysql/Database';
import { User } from '../domain/User';

export class AdminService {
  private db: DB;

  constructor(db: DB) {
    this.db = db;
  }
  async getStats() {
    return await this.db.getSubmissionCountAllPhases();
  }

  async getNetIdsForDeliverablePhase(phase: number) {
    return await this.db.getNetIdsForDeliverablePhase(phase);
  }

  async listAdmins(): Promise<User[]> {
    return await this.db.listAdmins();
  }

  async addAdmin(netId: string) {
    return !!(await this.db.addAdmin(netId));
  }

  async removeAdmin(netId: string) {
    return !!(await this.db.removeAdmin(netId));
  }

  async moveStudentDataToBackup() {
    await this.db.moveSubmissionDataToBackupTable();
    await this.db.moveNonAdminUserDataToBackupTable();
  }

  async restoreStudentDataFromBackup() {
    await this.db.restoreUserDataFromBackupTable();
    await this.db.restoreSubmissionDataFromBackupTable();
  }
}
