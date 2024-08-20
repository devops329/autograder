import { Github } from '../../../grading/tools/Github';
import { User } from '../../../model/domain/User';

export class MockGithub implements Github {
  private _githubFileContents: string = '';
  private _workflowFileContents: string = '';
  private _workflowRuns: boolean = true;
  private _workflowSuccess: boolean = true;
  private _versionNumber: string = '1.0.0';
  private _incrementVersion: boolean = true;
  set githubFileContents(contents: string) {
    this._githubFileContents = contents;
  }
  set workflowFileContents(contents: string) {
    this._workflowFileContents = contents;
  }
  set workflowRuns(runs: boolean) {
    this._workflowRuns = runs;
  }
  set workflowSuccess(success: boolean) {
    this._workflowSuccess = success;
  }
  set versionNumber(version: string) {
    this._versionNumber = version;
  }
  set incrementVersion(increment: boolean) {
    this._incrementVersion = increment;
  }

  async readGithubFile(user: User, repo: string, path: string, gradeAttemptId: string): Promise<string> {
    return this._githubFileContents;
  }
  async readWorkflowFile(user: User, repo: string, gradeAttemptId: string): Promise<string> {
    return this._workflowFileContents;
  }
  async triggerWorkflowAndWaitForCompletion(user: User, repo: string, file: string, gradeAttemptId: string, inputs?: object): Promise<boolean> {
    if (this._incrementVersion) {
      this.versionNumber = '1.0.1';
    }
    return this._workflowRuns;
  }
  async checkRecentRunSuccess(user: User, repo: string, file: string, gradeAttemptId: string): Promise<boolean> {
    return this._workflowSuccess;
  }
  async getMostRecentRun(user: User, repo: string, file: string, gradeAttemptId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async waitForCompletion(user: User, repo: string, file: string, gradeAttemptId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async getVersionNumber(user: User, repo: string, app: 'frontend' | 'backend', gradeAttemptId: string): Promise<string> {
    return this._versionNumber;
  }
  async readCoverageBadge(user: User, repo: string, gradeAttemptId: string): Promise<string> {
    return '';
  }
  async getMostRecentRelease(user: User, repo: string, gradeAttemptId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
