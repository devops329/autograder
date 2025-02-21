import { Assignment, Canvas } from '../../../model/dao/canvas/Canvas';

export class MockCanvas implements Canvas {
  private _success = true;

  set success(success: boolean) {
    this._success = success;
  }
  async getStudentId(netid: string): Promise<number> {
    return 1;
  }
  async getStudentInfo(netId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async updateGrade(netId: string, assignmentId: number, studentId: number, score: number, gradeAttemptId: string): Promise<string | void> {
    if (!this._success) {
      return 'Error';
    }
    return;
  }
  async getAssignmentIdsAndDueDates(): Promise<Map<number, Assignment>> {
    return new Promise((resolve, reject) => {
      const mockAssignments = new Map<number, Assignment>();
      mockAssignments.set(1, {
        id: 1,
        due_at: new Date().toDateString(),
        phase: 1,
      });
      resolve(mockAssignments);
    });
  }
}
