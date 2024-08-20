import { Github } from '../../../grading/tools/Github';
import { User } from '../../../model/domain/User';

export class MockGithub implements Github {
  private _githubFileContents: string = '';
  private _workflowFileContents: string = '';
  private _workflowSuccess: boolean = true;
  set githubFileContents(contents: string) {
    this._githubFileContents = contents;
  }
  set workflowFileContents(contents: string) {
    this._workflowFileContents = contents;
  }
  set workflowSuccess(success: boolean) {
    this._workflowSuccess = success;
  }

  async readGithubFile(user: User, repo: string, path: string, gradeAttemptId: string): Promise<string> {
    return this._githubFileContents;
  }
  async readWorkflowFile(user: User, repo: string, gradeAttemptId: string): Promise<string> {
    return this._workflowFileContents;
  }
  async triggerWorkflowAndWaitForCompletion(user: User, repo: string, file: string, gradeAttemptId: string, inputs?: object): Promise<boolean> {
    return this._workflowSuccess;
  }
  async checkRecentRunSuccess(user: User, repo: string, file: string, gradeAttemptId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  async getMostRecentRun(user: User, repo: string, file: string, gradeAttemptId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async waitForCompletion(user: User, repo: string, file: string, gradeAttemptId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async getVersionNumber(user: User, repo: string, app: 'frontend' | 'backend', gradeAttemptId: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  async readCoverageBadge(user: User, repo: string, gradeAttemptId: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  async getMostRecentRelease(user: User, repo: string, gradeAttemptId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
