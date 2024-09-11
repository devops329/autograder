import dns from 'dns';
import logger from '../../logger';

export class GradingTools {
  async checkDNS(hostname: string, regex: RegExp, gradeAttemptId: string): Promise<boolean> {
    const timeout = (ms: number) => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));

    try {
      // Resolve CNAME records
      // Error if check takes longer than 5 seconds
      const addresses = await Promise.race([
        new Promise<string[]>((resolve, reject) => {
          dns.resolveCname(hostname, (err, addresses) => {
            if (err) reject(err);
            else resolve(addresses);
          });
        }),
        timeout(5000), // Set timeout duration as needed
      ]);

      let matchesRegex = false;
      addresses.forEach((address) => {
        const matches = address.match(regex);
        if (matches) {
          matchesRegex = true;
          return;
        }
      });
      return matchesRegex;
    } catch (e) {
      logger.log('error', { type: 'dns_error', service: 'grade_tools', gradeAttemptId }, { hostname, error: e });
      return false;
    }
  }

  async fetchWithTimeout(url: string, timeout: number) {
    const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout));

    const fetchPromise = fetch(url);

    return Promise.race([fetchPromise, timeoutPromise]);
  }

  async checkResponseHeadersForText(hostname: string, regex: RegExp): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`https://${hostname}`, 5000); // 5 seconds timeout
      const headers = response.headers;

      let matches = false;
      headers.forEach((header) => {
        if (header.match(regex)) {
          matches = true;
          return;
        }
      });
      return matches;
    } catch (error) {
      logger.log('error', { type: 'fetch_error', service: 'grade_tools' }, { hostname, error });
      return false;
    }
  }

  async checkPageBodyForText(hostname: string, regex: RegExp): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`https://${hostname}`, 5000); // 5 seconds timeout
      const body = await response.text();

      const matches = body.match(regex);
      return !!matches;
    } catch (error) {
      logger.log('error', { type: 'fetch_error', service: 'grade_tools' }, { hostname, error });
      return false;
    }
  }

  async readPageJson(hostname: string): Promise<any> {
    const response = await fetch(`https://${hostname}`);
    return response.json();
  }

  async getEnvVariable(envFile: string, variableName: string): Promise<string> {
    const envVars = envFile.split('\n');
    let variableValue = '';
    for (const envVar of envVars) {
      const [envKey, value] = envVar.split('=');
      if (envKey.trim() === variableName) {
        variableValue = value.trim();
      }
    }
    return variableValue;
  }

  async createUserAndLogin(serviceUrl: string, gradeAttemptId: string): Promise<boolean> {
    try {
      const response = await fetch(`${serviceUrl}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'test',
          email: 'test@test',
          password: 'test',
        }),
      });
      if (!response.ok) {
        logger.log('error', { type: 'create_user_error', service: 'grade_tools', gradeAttemptId }, { status: response.status });
        return false;
      }

      const loginResponse = await fetch(`${serviceUrl}/api/auth`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test',
          password: 'test',
        }),
      });
      if (!loginResponse.ok) {
        logger.log('error', { type: 'login_error', service: 'grade_tools', gradeAttemptId }, { status: loginResponse.status });
        return false;
      }
    } catch (e) {
      logger.log('error', { type: 'create_user_and_login_error', service: 'grade_tools', gradeAttemptId }, { error: e });
      return false;
    }

    return true;
  }

  async checkCoverage(badge: string, percentage: number) {
    const regex = /Coverage: (\d+\.\d+)%/;
    const matches = badge.match(regex);
    if (matches && parseFloat(matches[1]) >= percentage) {
      return true;
    }
    return false;
  }

  getHostnameFromWebsite(website: string): string {
    const siteParts = website.split('.');
    const hostname = siteParts.slice(-2).join('.');
    return hostname;
  }
}
