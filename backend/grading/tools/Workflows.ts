import { config } from '../../config';
import { User } from '../../model/domain/User';

export class Workflows {
  async readWorkflowFile(user: User, repo: string): Promise<string> {
    const workflowFileUrl = `https://raw.githubusercontent.com/${user.github}/${repo}/main/.github/workflows/ci.yml`;
    const response = await fetch(workflowFileUrl);
    if (!response.ok) {
      console.error('Error fetching workflow file:', response.status);
      return '';
    }
    return await response.text();
  }
  async triggerWorkflow(user: User, repo: string): Promise<void> {
    const url = `https://api.github.com/repos/${user.github}/${repo}/actions/workflows/ci.yml/dispatches`;
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
        console.error('Error triggering the action:', response.status);
      }
    } catch (error) {
      console.error('Error triggering the action:', error);
    }
    // Wait a few seconds for the run to start
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  async getMostRecentRun(user: User, repo: string): Promise<any> {
    const url = `https://api.github.com/repos/${user.github}/${repo}/actions/workflows/ci.yml/runs`;
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

  async waitForCompletion(user: User, repo: string): Promise<void> {
    let run = await this.getMostRecentRun(user, repo);
    if (!run) {
      console.error('No run found');
      return;
    }

    while (run.status !== 'completed') {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      run = await this.getMostRecentRun(user, repo);
      if (!run) {
        console.error('No updated run found');
        return;
      }
    }
  }
}
