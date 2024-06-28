import { User } from '../../model/domain/User';
import { DeliverableOne } from './DeliverableOne';
import { Grader } from './Grader';
import { Github } from '../tools/Github';
import { DB } from '../../model/dao/mysql/Database';
import { CommitHistory } from '../tools/CommitHistory';

export class DeliverableTwo implements Grader {
  async grade(user: User): Promise<number> {
    const hostname = user.website;
    let score = 0;

    // Check commit history
    const github = new Github(user, 'jwt-pizza');
    const db = new DB();
    const repo = 'jwt-pizza';
    const deliverable = 2;
    const dueDate = new Date('2024-9-20');
    const minimumCommits = 5;
    const commitPoints = 20;
    const commitHistory = new CommitHistory(db, user, repo, deliverable, dueDate, minimumCommits, commitPoints);
    const commitScore = await commitHistory.checkCommitHistory();
    score += commitScore;

    if (!hostname) {
      console.error('No hostname found for user:', user.netId);
      return score;
    }

    // Read workflow file
    const workflowFileContents = await github.readWorkflowFile();
    const deployedToPages = workflowFileContents.includes('actions/deploy-pages');
    if (!deployedToPages) {
      console.error('Not deployed to pages');
      return score;
    }
    score += 30;

    // Trigger the action and wait for it to complete
    await github.triggerWorkflow();

    // Check for successful deployment
    const deliverableOne = new DeliverableOne();
    const deployedScore = await deliverableOne.grade(user);
    score += deployedScore * 0.7;

    return score;
  }
}
