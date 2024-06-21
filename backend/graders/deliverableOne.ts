import { User } from '../model/domain/User';
import { Grader } from './Grader';
import dns from 'dns';

export class DeliverableOneGrader implements Grader {
  async grade(user: User): Promise<number> {
    const hostname = user.website;

    if (!hostname) {
      console.error('No hostname found for user:', user.netId);
      return 0;
    }

    let pageExists = false;
    let pageDeployedWithGithub = false;
    const regex = /JWT Pizza/g;

    try {
      pageExists = await this.checkPageExists(hostname, regex);
      pageDeployedWithGithub = await this.checkPageDeployedWithGithub(hostname);
    } catch (e) {
      console.error(e);
    }

    let score = 0;
    if (pageExists) {
      score += 50;
    }
    if (pageDeployedWithGithub) {
      score += 50;
    }

    return score;
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

  async checkPageDeployedWithGithub(hostname: string): Promise<boolean> {
    const addresses = await new Promise<string[]>((resolve, reject) => {
      dns.resolveCname(hostname, (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });

    let deployedWithGithub = false;
    addresses.forEach((address) => {
      const regex = /github.io/g;
      const matches = address.match(regex);
      if (matches) {
        console.log('Page deployed with Github');
        deployedWithGithub = true;
        return;
      }
    });

    return deployedWithGithub;
  }
}
