import { User } from '../../model/domain/User';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';
import dns from 'dns';

export class DeliverableOne implements Grader {
  async grade(user: User): Promise<number> {
    const hostname = user.website;
    const tools = new GradingTools();

    if (!hostname) {
      console.error('No hostname found for user:', user.netId);
      return 0;
    }

    let pageExists = false;
    let pageDeployedWithGithub = false;

    try {
      pageExists = await tools.checkPageExists(hostname, /JWT Pizza/g);
      pageDeployedWithGithub = await tools.checkDNS(hostname, /github\.io/);
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
}
