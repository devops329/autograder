import { config } from '../../config';
import logger from '../../logger';
import { User } from '../../model/domain/User';

export class Github {
  private user: User;
  private repo: string;
  constructor(user: User, repo: string) {
    this.user = user;
    this.repo = repo;
  }

  setRepo(repo: string) {
    this.repo = repo;
  }

  async readGithubFile(path: string, gradeAttemptId: string): Promise<string> {
    const apiUrl = `https://api.github.com/repos/${this.user.github}/${this.repo}/contents/${path}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      logger.log('error', [{ type: 'github_file_fetch', gradeAttemptId }], { path, user: this.user.netId, status: response.status });
      return '';
    }
    // get the content and base 64 decode it
    const content = (await response.json()).content;
    return atob(content);
  }
  async readWorkflowFile(gradeAttemptId: string): Promise<string> {
    return this.readGithubFile('.github/workflows/ci.yml', gradeAttemptId);
  }

  async triggerWorkflowAndWaitForCompletion(file: string, gradeAttemptId: string, inputs?: object): Promise<boolean> {
    const url = `https://api.github.com/repos/${this.user.github}/${this.repo}/actions/workflows/${file}/dispatches`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `token ${config.github.personal_access_token}`,
          Accept: 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs,
        }),
      });
      if (response.status !== 204) {
        logger.log('error', [{ type: 'github_action_trigger', gradeAttemptId }], { file, user: this.user.netId, status: response.status, body: await response.text() });
        return false;
      }
    } catch (error) {
      logger.log('error', [{ type: 'github_action_trigger', gradeAttemptId }], { file, user: this.user.netId, error });
    }
    // Wait a few seconds for the run to start
    await new Promise((resolve) => setTimeout(resolve, 5000));
    // Wait for the run to complete
    await this.waitForCompletion(file, gradeAttemptId);
    return true;
  }

  async checkRecentRunSuccess(file: string, gradeAttemptId: string): Promise<boolean> {
    const run = await this.getMostRecentRun(file, gradeAttemptId);
    return run && run.conclusion === 'success';
  }

  async getMostRecentRun(file: string, gradeAttemptId: string): Promise<any> {
    const url = `https://api.github.com/repos/${this.user.github}/${this.repo}/actions/workflows/${file}/runs`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `token ${config.github.personal_access_token}`,
          Accept: 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      if (!response.ok) {
        logger.log('error', [{ type: 'github_run_fetch', gradeAttemptId }], { file, user: this.user.netId, status: response.status });
        return null;
      }
      const data = await response.json();
      return data.workflow_runs[0];
    } catch (error) {
      logger.log('error', [{ type: 'github_run_fetch', gradeAttemptId }], { file, user: this.user.netId, error });
      return null;
    }
  }

  async waitForCompletion(file: string, gradeAttemptId: string): Promise<void> {
    let run = await this.getMostRecentRun(file, gradeAttemptId);
    if (!run) {
      console.error('No run found');
      return;
    }

    while (run.status !== 'completed') {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      run = await this.getMostRecentRun(file, gradeAttemptId);
      if (!run) {
        logger.log('error', [{ type: 'github_run_fetch', gradeAttemptId }], { file, user: this.user.netId });
        return;
      }
    }
  }
  async getVersionNumber(app: 'frontend' | 'backend', gradeAttemptId: string): Promise<string> {
    const apiUrl = `https://api.github.com/repos/${this.user.github}/${this.repo}/contents/${app === 'frontend' ? 'public' : 'src'}/version.json`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      logger.log('error', [{ type: 'github_file_fetch', gradeAttemptId }], { path: 'version.json', user: this.user.netId, status: response.status });
      return '';
    }
    // get the content and base 64 decode it
    const content = (await response.json()).content;
    const version = JSON.parse(atob(content)).version;
    return version;
  }
  async readCoverageBadge(gradeAttemptId: string): Promise<string> {
    return this.readGithubFile('coverageBadge.svg', gradeAttemptId);
  }

  async getMostRecentRelease(gradeAttemptId: string) {
    const url = `https://api.github.com/repos/${this.user.github}/${this.repo}/releases/latest`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        logger.log('error', [{ type: 'github_release_fetch', gradeAttemptId }], { user: this.user.netId, status: response.status });
        return null;
      }
      return await response.json();
    } catch (error) {
      logger.log('error', [{ type: 'github_release_fetch', gradeAttemptId }], { user: this.user.netId, error });
      return null;
    }
  }
}
