import { User } from '../../model/domain/User';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

export class DeliverableOne implements Grader {
  async grade(user: User): Promise<number> {
    // const commitHistory = new CommitHistory();
    // const commits = await commitHistory.checkCommitHistory(user, 'jwt-pizza', 1, 5);

    const hostname = user.website;
    const tools = new GradingTools();

    let score = 0;

    if (!hostname) {
      console.error('No hostname found for user:', user.netId);
      return 0;
    }

    let customDomainNameSuccess = false;
    let githubPagesSuccess = false;

    try {
      customDomainNameSuccess = await tools.checkPageExists(hostname, /JWT Pizza/g);
      githubPagesSuccess = await tools.checkDNS(hostname, /github\.io/);
    } catch (e) {
      console.error(e);
    }

    if (customDomainNameSuccess) {
      score += 30;
    }
    if (githubPagesSuccess) {
      score += 70;
    }

    return score;
  }
}
