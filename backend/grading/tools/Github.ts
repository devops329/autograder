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
  async readGithubFile(path: string): Promise<string> {
    const apiUrl = `https://api.github.com/repos/${this.user.github}/${this.repo}/contents/${path}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error('Error fetching version file:', response.status);
      return '';
    }
    // get the content and base 64 decode it
    const content = (await response.json()).content;
    return atob(content);
  }
  async readWorkflowFile(): Promise<string> {
    return this.readGithubFile('.github/workflows/ci.yml');
  }
  async triggerWorkflow(): Promise<boolean> {
    const url = `https://api.github.com/repos/${this.user.github}/${this.repo}/actions/workflows/ci.yml/dispatches`;
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
        }),
      });
      if (response.status !== 204) {
        console.log(await response.text());
        console.error('Error triggering the action:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error triggering the action:', error);
    }
    // Wait a few seconds for the run to start
    await new Promise((resolve) => setTimeout(resolve, 5000));
    // Wait for the run to complete
    await this.waitForCompletion();
    return true;
  }

  async getMostRecentRun(): Promise<any> {
    const url = `https://api.github.com/repos/${this.user.github}/${this.repo}/actions/workflows/ci.yml/runs`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `token ${config.github.personal_access_token}`,
          Accept: 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      if (!response.ok) {
        console.error('Error fetching the most recent run:', response.status);
        return null;
      }
      const data = await response.json();
      return data.workflow_runs[0];
    } catch (error) {
      console.error('Error fetching the most recent run:', error);
      return null;
    }
  }

  async waitForCompletion(): Promise<void> {
    let run = await this.getMostRecentRun();
    if (!run) {
      console.error('No run found');
      return;
    }

    while (run.status !== 'completed') {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      run = await this.getMostRecentRun();
      if (!run) {
        console.error('No updated run found');
        return;
      }
    }
  }
  async getVersionNumber(): Promise<string> {
    const apiUrl = `https://api.github.com/repos/${this.user.github}/${this.repo}/contents/src/version.json`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error('Error fetching version file:', response.status);
      return '';
    }
    // get the content and base 64 decode it
    const content = (await response.json()).content;
    const version = JSON.parse(atob(content)).version;
    return version;
  }
  async readCoverageBadge(): Promise<string> {
    return this.readGithubFile('coverageBadge.svg');
  }

  async getCommits(): Promise<object[]> {
    const url = `https://api.github.com/repos/${this.user.github}/${this.repo}/commits`;
    try {
      const response = await fetch(url);
      const commits = await response.json();
      return commits as object[];
    } catch (error) {
      logger.log('error', 'commits_fetch', this.user.github);
    }
    return [];
  }
}
