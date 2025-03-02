import { Assignment, Canvas } from '../dao/canvas/Canvas';
import { DB } from '../dao/mysql/Database';
import { DeliverableStat } from '../domain/DeliverableStat';
import { User } from '../domain/User';

export class AdminService {
  private db: DB;
  private canvas: Canvas;

  constructor(db: DB, canvas: Canvas) {
    this.db = db;
    this.canvas = canvas;
  }
  async getStats(): Promise<Map<number, DeliverableStat>> {
    // Get due dates for deliverables
    const assignmentsAndDueDates: Map<number, Assignment> = await this.canvas.getAssignmentIdsAndDueDates();
    const deliverableStats = new Map<number, DeliverableStat>();
    for (let [key, assignment] of assignmentsAndDueDates) {
      const studentsOnTime = await this.db.getStudentNetIdsWithLastSubmissionOnTimeForDeliverable(key, assignment.due_at);
      const studentsLate = await this.db.getStudentNetIdsWithLastSubmissionLateForDeliverable(key, assignment.due_at);
      const studentsNotSubmitted = await this.db.getStudentNetIdsNotSubmittedForDeliverable(key);
      deliverableStats.set(key, {
        studentsOnTime,
        studentsLate,
        studentsNotSubmitted,
      });
    }
    return deliverableStats;
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

  async clearDatabase() {
    await this.db.clearDatabase();
  }

  async restoreDatabase() {
    await this.db.restoreDatabaseFromBackup();
  }
}
