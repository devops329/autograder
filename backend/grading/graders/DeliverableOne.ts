import { User } from '../../model/domain/User';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

interface DeliverableOneRubric {
  customDomainName: number;
  githubPages: number;
  comments: string;
}

export class DeliverableOne implements Grader {
  private tools: GradingTools;

  constructor(tools: GradingTools) {
    this.tools = tools;
  }
  async grade(user: User, gradeAttemptId: string): Promise<[number, DeliverableOneRubric]> {
    const rubric: DeliverableOneRubric = {
      customDomainName: 0,
      githubPages: 0,
      comments: '',
    };
    const hostname = user.website;

    let score = 0;

    if (!hostname) {
      rubric.comments += 'No website provided.\n';
      return [0, rubric];
    }

    let customDomainNameSuccess = false;
    let githubPagesSuccess = false;

    customDomainNameSuccess = await this.tools.checkPageBodyForText(hostname, /JWT Pizza/g);
    githubPagesSuccess = await this.tools.checkDNS(hostname, /github\.io/, gradeAttemptId);

    if (customDomainNameSuccess) {
      score += 30;
      rubric.customDomainName += 30;
    } else {
      rubric.comments += 'JWT Pizza is not functional at the provided website.\n';
    }

    if (githubPagesSuccess) {
      if (customDomainNameSuccess) {
        score += 40;
        rubric.githubPages += 40;
      }
      score += 30;
      rubric.githubPages += 30;
    } else {
      rubric.comments += 'Your website is not hosted by GitHub Pages.\n';
    }
    return [score, rubric];
  }
}
