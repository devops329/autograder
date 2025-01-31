import { Github } from '../../../grading/tools/Github';
import { User } from '../../../model/domain/User';
import { mockRelease, mockRelease2 } from '../mockValues';

export class MockGithub implements Github {
  private _githubFileContents: string = '';
  private _workflowFileContents: string = '';
  private _workflowRuns: boolean = true;
  private _workflowSuccess: boolean = true;
  private _versionNumber: string = '1.0.0';
  private _incrementVersion: boolean = true;
  private _createNewRelease: boolean = true;
  private _releaseNumber: object = mockRelease;
  private _failSecondWorkflowTrigger: boolean = false;
  private _failSecondWorkflowCompletion: boolean = false;
  private _createProductionRelease: boolean = true;

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
  set createNewStagingRelease(create: boolean) {
    this._createNewRelease = create;
  }
  set failSecondWorkflowTrigger(fail: boolean) {
    this._failSecondWorkflowTrigger = fail;
  }
  set failSecondWorkflowCompletion(fail: boolean) {
    this._failSecondWorkflowCompletion = fail;
  }
  set createProductionRelease(create: boolean) {
    this._createProductionRelease = create;
  }

  set releaseNumber(release: object) {
    this._releaseNumber = release;
  }

  async readGithubFile(user: User, repo: string, path: string, gradeAttemptId: string): Promise<string | null> {
    return this._githubFileContents;
  }
  async readWorkflowFile(user: User, repo: string, gradeAttemptId: string): Promise<string> {
    return this._workflowFileContents;
  }
  async triggerWorkflowAndWaitForCompletion(user: User, repo: string, file: string, gradeAttemptId: string, inputs?: object): Promise<boolean> {
    if (this._incrementVersion) {
      this.versionNumber = '1.0.1';
    }
    const triggers = this._workflowRuns;
    if (this._failSecondWorkflowTrigger) {
      this._workflowRuns = false;
    }
    return triggers;
  }
  async checkRecentRunSuccess(user: User, repo: string, file: string, gradeAttemptId: string): Promise<boolean> {
    const success = this._workflowSuccess;
    if (this._failSecondWorkflowCompletion) {
      this._workflowSuccess = false;
    }
    return success;
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
  async readCoverageBadge(user: User, repo: string, gradeAttemptId: string): Promise<string | null> {
    return null;
  }
  async getMostRecentRelease(user: User, repo: string, gradeAttemptId: string): Promise<any> {
    const release = this._releaseNumber;
    if (this._createNewRelease) {
      this._releaseNumber = this._releaseNumber === mockRelease ? mockRelease2 : mockRelease;
      if (!this._createProductionRelease) {
        this._createNewRelease = false;
      }
    }
    return release;
  }

  async isCollaborator(user: User, repo: string, collaborator: string, gradeAttemptId: string): Promise<boolean> {
    return true;
  }
}
