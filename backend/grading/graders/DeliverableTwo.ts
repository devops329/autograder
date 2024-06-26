import { User } from '../../model/domain/User';
import { DeliverableOne } from './DeliverableOne';
import { Grader } from './Grader';
import { Github } from '../tools/Github';

export class DeliverableTwo implements Grader {
  async grade(user: User): Promise<number> {
    const hostname = user.website;
    const github = new Github(user, 'jwt-pizza');
    let score = 0;

    if (!hostname) {
      console.error('No hostname found for user:', user.netId);
      return score;
    }

    const repo = 'jwt-pizza';

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
