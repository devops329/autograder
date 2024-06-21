import { s } from 'vite/dist/node/types.d-aGj9QkWt';
import { config } from '../config';
import { User } from '../model/domain/User';
import { DeliverableOneGrader } from './DeliverableOne';
import { Grader } from './Grader';

export class DeliverableTwoGrader implements Grader {
  async grade(user: User): Promise<number> {
    const hostname = user.website;
    let score = 0;

    if (!hostname) {
      console.error('No hostname found for user:', user.netId);
      return score;
    }

    // Read workflow file
    const workflowFileContents = await this.readWorkflowFile(user);
    const deployedToPages = workflowFileContents.includes('actions/deploy-pages');
    if (!deployedToPages) {
      console.error('Not deployed to pages');
      return score;
    }
    score += 30;

    // Trigger the action
    await this.triggerAction(user);

    // Wait a few seconds for the run to start
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Get the most recent run
    let run = await this.getMostRecentRun(user);
    if (!run) {
      console.error('No run found');
      return score;
    }

    // Wait for the run to finish
    while (run.status !== 'completed') {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      run = await this.getMostRecentRun(user);
      if (!run) {
        console.error('No updated run found');
        return score;
      }
    }

    // Check for successful deployment
    const deliverableOne = new DeliverableOneGrader();
    const deployedScore = await deliverableOne.grade(user);
    score += deployedScore * 0.7;

    return score;
  }

  async readWorkflowFile(user: User): Promise<string> {
    const workflowFileUrl = `https://raw.githubusercontent.com/${user.github}/jwt-pizza/main/.github/workflows/ci.yml`;
    const response = await fetch(workflowFileUrl);
    if (!response.ok) {
      console.error('Error fetching workflow file:', response.status);
      return '';
    }
    return await response.text();
  }

  async triggerAction(user: User): Promise<void> {
    const url = `https://api.github.com/repos/${user.github}/jwt-pizza/actions/workflows/ci.yml/dispatches`;
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
  }

  async getMostRecentRun(user: User): Promise<any> {
    const url = `https://api.github.com/repos/${user.github}/jwt-pizza/actions/workflows/ci.yml/runs`;
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
}
