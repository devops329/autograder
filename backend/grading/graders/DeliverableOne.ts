import { DB } from '../../model/dao/mysql/Database';
import { User } from '../../model/domain/User';
import { CommitHistory } from '../tools/CommitHistory';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

export class DeliverableOne implements Grader {
  async grade(user: User): Promise<number> {
    // const commitHistory = new CommitHistory();
    // const commits = await commitHistory.checkCommitHistory(user, 'jwt-pizza', 1, 5);

    const hostname = user.website;
    const tools = new GradingTools();

    let score = 0;

    // Check commit history
    const db = new DB();
    const repo = 'jwt-pizza';
    const deliverable = 1;
    const dueDate = new Date('2024-9-20');
    const minimumCommits = 5;
    const commitPoints = 20;
    const commitHistory = new CommitHistory(db, user, repo, deliverable, dueDate, minimumCommits, commitPoints);
    const commitScore = await commitHistory.checkCommitHistory();
    score += commitScore;

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

    if (pageExists) {
      score += 50;
    }
    if (pageDeployedWithGithub) {
      score += 50;
    }

    return score;
  }
}
