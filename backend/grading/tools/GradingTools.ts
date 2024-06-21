import { config } from '../../config';
import { User } from '../../model/domain/User';
import dns from 'dns';

export class GradingTools {
  async readGithubFile(user: User, repo: string, path: string): Promise<string> {
    const fileUrl = `https://raw.githubusercontent.com/${user.github}/${repo}/main/${path}`;
    const response = await fetch(fileUrl);
    if (!response.ok) {
      console.error('Error fetching file:', response.status);
      return '';
    }
    return await response.text();
  }
  async readWorkflowFile(user: User, repo: string): Promise<string> {
    return this.readGithubFile(user, repo, '.github/workflows/ci.yml');
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
    // Wait for the run to complete
    await this.waitForCompletion(user, repo);
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
  async getVersionNumber(user: User, repo: string): Promise<string> {
    const versionUrl = `https://raw.githubusercontent.com/${user.github}/${repo}/main/version.json`;
    const response = await fetch(versionUrl);
    if (!response.ok) {
      console.error('Error fetching version file:', response.status);
      return '';
    }
    return (await response.json()).version;
  }
  async readCoverageBadge(user: User, repo: string): Promise<string> {
    return this.readGithubFile(user, repo, 'coverage/badge.svg');
  }

  async checkDNS(hostname: string, regex: RegExp): Promise<boolean> {
    const addresses = await new Promise<string[]>((resolve, reject) => {
      dns.resolveCname(hostname, (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });

    let matchesRegex = false;
    addresses.forEach((address) => {
      const matches = address.match(regex);
      if (matches) {
        console.log('DNS check matches');
        matchesRegex = true;
        return;
      }
    });
    return matchesRegex;
  }

  async checkPageExists(hostname: string, regex: RegExp): Promise<boolean> {
    const response = await fetch(`https://${hostname}`);
    const body = await response.text();

    const matches = body.match(regex);
    if (matches) {
      console.log('Page exists');
      return true;
    }
    return false;
  }

  async createUserAndLogin(serviceUrl: string): Promise<boolean> {
    const response = await fetch(`${serviceUrl}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        email: 'test@test',
        password: 'test',
      }),
    });
    if (!response.ok) {
      console.error('Error creating user:', response.status);
      return false;
    }

    const loginResponse = await fetch(`${serviceUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test',
        password: 'test',
      }),
    });
    if (!loginResponse.ok) {
      console.error('Error logging in:', loginResponse.status);
      return false;
    }
    return true;
  }
}
