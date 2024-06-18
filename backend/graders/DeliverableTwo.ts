import { config } from '../config';
import { User } from '../model/domain/User';
import { DeliverableOneGrader } from './DeliverableOne';
import { Grader } from './Grader';

const FUNCTIONAL_GITHUB_PAGES_PERCENTAGE = 0.5;

export class DeliverableTwoGrader implements Grader {
  async grade(user: User): Promise<number> {
    const hostname = user.website;

    if (!hostname) {
      console.error('No hostname found for user:', user.netId);
      return 0;
    }

    const deliverableOne = new DeliverableOneGrader();
    const deliverableOneScore = await deliverableOne.grade(user);
    const functionalGithubPagesScore = deliverableOneScore * FUNCTIONAL_GITHUB_PAGES_PERCENTAGE;

    // actions/deploy-pages
    const mostRecentGithubActionRun = await this.getMostRecentGithubActionRun(user.github, 'jwt-pizza', config.github.personal_access_token);
    const jobsUrl = mostRecentGithubActionRun.jobs_url;
    const jobsDetails = await this.getJobsDetails(jobsUrl, config.github.personal_access_token);

    try {
      const deployJob = jobsDetails.jobs.find((job: any) => job.name === 'deploy');
      const deployJobStatus = deployJob.conclusion;
      if (deployJobStatus === 'success') {
        console.log('GitHub Pages deployment job succeeded.');
        return functionalGithubPagesScore + (1 - FUNCTIONAL_GITHUB_PAGES_PERCENTAGE) * 100;
      }
    } catch (error) {
      console.error('Failed to fetch GitHub Action with deploy stage:', error);
      return functionalGithubPagesScore;
    }
    return functionalGithubPagesScore;
  }

  async getJobsDetails(jobsUrl: string, token: string): Promise<any> {
    try {
      const response = await fetch(jobsUrl, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch GitHub Actions jobs:', error);
      return null;
    }
  }

  async getMostRecentGithubActionRun(owner: string, repo: string, token: string): Promise<any> {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      const data = await response.json();
      const runs = data.workflow_runs;
      if (runs.length === 0) {
        console.error('No workflow runs found.');
        return null;
      }
      // Assuming the first run is the most recent one
      return runs[0];
    } catch (error) {
      console.error('Failed to fetch GitHub Actions runs:', error);
      return null;
    }
  }
}
