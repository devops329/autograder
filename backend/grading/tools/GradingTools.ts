import dns from 'dns';
import logger from '../../logger';

export class GradingTools {
  async checkDNS(hostname: string, regex: RegExp, gradeAttemptId: string): Promise<boolean> {
    try {
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
          matchesRegex = true;
          return;
        }
      });
      return matchesRegex;
    } catch (e) {
      logger.log('error', [{ type: 'dns_error', gradeAttemptId }], { hostname, error: e });
      return false;
    }
  }

  async checkPageExistsAndContainsText(hostname: string, regex: RegExp): Promise<boolean> {
    const response = await fetch(`https://${hostname}`);
    const body = await response.text();

    const matches = body.match(regex);
    return !!matches;
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

  async createUserAndLogin(serviceUrl: string): Promise<boolean> {
    try {
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
    } catch (e) {
      console.error('Error creating user:', e);
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
}
