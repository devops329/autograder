import { config } from '../../config';
import logger from '../../logger';
import { User } from '../../model/domain/User';

export class Github {
  async readGithubFile(user: User, repo: string, path: string, gradeAttemptId: string): Promise<string> {
    const apiUrl = `https://api.github.com/repos/${user.github}/${repo}/contents/${path}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      logger.log('error', { type: 'github_file_fetch', service: 'github', gradeAttemptId }, { path, user: user.netId, status: response.status });
      return '';
    }
    // get the content and base 64 decode it
    const content = (await response.json()).content;
    return atob(content);
  }
  async readWorkflowFile(user: User, repo: string, gradeAttemptId: string): Promise<string> {
    return this.readGithubFile(user, repo, '.github/workflows/ci.yml', gradeAttemptId);
  }

  async triggerWorkflowAndWaitForCompletion(user: User, repo: string, file: string, gradeAttemptId: string, inputs?: object): Promise<boolean> {
    const url = `https://api.github.com/repos/${user.github}/${repo}/actions/workflows/${file}/dispatches`;
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
        logger.log(
          'error',
          { type: 'github_action_trigger', service: 'github', gradeAttemptId },
          { file, user: user.netId, status: response.status, body: await response.text() }
        );
        return false;
      }
    } catch (error) {
      logger.log('error', { type: 'github_action_trigger', service: 'github', gradeAttemptId }, { file, user: user.netId, error });
    }
    // Wait a few seconds for the run to start
    await new Promise((resolve) => setTimeout(resolve, 5000));
    // Wait for the run to complete
    await this.waitForCompletion(user, repo, file, gradeAttemptId);
    return true;
  }

  async checkRecentRunSuccess(user: User, repo: string, file: string, gradeAttemptId: string): Promise<boolean> {
    const run = await this.getMostRecentRun(user, repo, file, gradeAttemptId);
    return run && run.conclusion === 'success';
  }

  async getMostRecentRun(user: User, repo: string, file: string, gradeAttemptId: string): Promise<any> {
    const url = `https://api.github.com/repos/${user.github}/${repo}/actions/workflows/${file}/runs`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `token ${config.github.personal_access_token}`,
          Accept: 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      if (!response.ok) {
        logger.log('error', { type: 'github_run_fetch', service: 'github', gradeAttemptId }, { file, user: user.netId, status: response.status });
        return null;
      }
      const data = await response.json();
      return data.workflow_runs[0];
    } catch (error) {
      logger.log('error', { type: 'github_run_fetch', service: 'github', gradeAttemptId }, { file, user: user.netId, error });
      return null;
    }
  }

  async waitForCompletion(user: User, repo: string, file: string, gradeAttemptId: string): Promise<void> {
    let run = await this.getMostRecentRun(user, repo, file, gradeAttemptId);
    if (!run) {
      logger.log('error', { type: 'github_run_fetch', service: 'github', gradeAttemptId }, { file, user: user.netId });
      return;
    }

    while (run.status !== 'completed') {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      run = await this.getMostRecentRun(user, repo, file, gradeAttemptId);
      if (!run) {
        logger.log('error', { type: 'github_run_fetch', service: 'github', gradeAttemptId }, { file, user: user.netId });
        return;
      }
    }
  }
  async getVersionNumber(user: User, repo: string, app: 'frontend' | 'backend', gradeAttemptId: string): Promise<string> {
    const apiUrl = `https://api.github.com/repos/${user.github}/${repo}/contents/${app === 'frontend' ? 'public' : 'src'}/version.json`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      logger.log(
        'error',
        { type: 'github_file_fetch', service: 'github', gradeAttemptId },
        { path: 'version.json', user: user.netId, status: response.status }
      );
      return '';
    }
    // get the content and base 64 decode it
    const content = (await response.json()).content;
    const version = JSON.parse(atob(content)).version;
    return version;
  }
  async readCoverageBadge(user: User, repo: string, gradeAttemptId: string): Promise<string> {
    return this.readGithubFile(user, repo, 'coverageBadge.svg', gradeAttemptId);
  }

  async getMostRecentRelease(user: User, repo: string, gradeAttemptId: string) {
    const url = `https://api.github.com/repos/${user.github}/${repo}/releases/latest`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        logger.log('error', { type: 'github_release_fetch', service: 'github', gradeAttemptId }, { user: user.netId, status: response.status });
        return null;
      }
      return await response.json();
    } catch (error) {
      logger.log('error', { type: 'github_release_fetch', service: 'github', gradeAttemptId }, { user: user.netId, error });
      return null;
    }
  }

  async isCollaborator(user: User, repo: string, collaborator: string, gradeAttemptId: string): Promise<boolean> {
    const url = `https://api.github.com/repos/${user.github}/${repo}/collaborators/${collaborator}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `token ${config.github.personal_access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (response.status === 204) {
      return true;
    } else if (response.status === 404) {
      return false;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  }
}
