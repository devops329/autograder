import { Canvas } from '../../../model/dao/canvas/Canvas';

export class MockCanvas implements Canvas {
  private _success = true;

  set success(success: boolean) {
    this._success = success;
  }
  async getStudentId(netid: string): Promise<number> {
    return 0;
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
  async getAssignmentIds(): Promise<{ [key: number]: number }> {
    return new Promise((resolve, reject) => {
      resolve({ 1: 1, 2: 2, 3: 3 });
    });
  }
}
