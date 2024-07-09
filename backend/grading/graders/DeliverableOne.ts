import { User } from '../../model/domain/User';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

interface Rubric {
  customDomainName: number;
  githubPages: number;
}

export class DeliverableOne implements Grader {
  async grade(user: User): Promise<[number, object]> {
    const rubric: Rubric = {
      customDomainName: 0,
      githubPages: 0,
    };
    const hostname = user.website;
    const tools = new GradingTools();

    let score = 0;

    if (!hostname) {
      console.error('No hostname found for user:', user.netId);
      return [0, rubric];
    }

    let customDomainNameSuccess = false;
    let githubPagesSuccess = false;

    try {
      customDomainNameSuccess = await tools.checkPageExistsAndContainsText(hostname, /JWT Pizza/g);
      githubPagesSuccess = await tools.checkDNS(hostname, /github\.io/);
    } catch (e) {
      console.error(e);
    }

    if (customDomainNameSuccess) {
      score += 30;
      rubric.customDomainName = 30;
    }
    if (githubPagesSuccess) {
      score += 70;
      rubric.githubPages = 70;
    }
    return [score, rubric];
  }
}
