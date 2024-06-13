import { Grader } from './Grader';
import dns from 'dns';

export class DeliverableOneGrader implements Grader {
  async grade(): Promise<number> {
    const hostname = 'pages-pizza.byucsstudent.click';
    let pageExists = false;
    let pageDeployedWithGithub = false;

    try {
      pageExists = await this.checkPageExists(hostname);
      pageDeployedWithGithub = await this.checkPageDeployedWithGithub(hostname);
    } catch (e) {
      console.error(e);
    }

    return pageExists && pageDeployedWithGithub ? 100 : 0;
  }

  async checkPageExists(hostname: string): Promise<boolean> {
    const response = await fetch(`https://${hostname}`);
    const body = await response.text();

    const regex = /JWT Pizza/g;
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
