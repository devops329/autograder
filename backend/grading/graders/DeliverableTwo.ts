import { User } from '../../model/domain/User';
import { DeliverableOneGrader } from './DeliverableOne';
import { Grader } from './Grader';
import { Workflows } from '../tools/Workflows';

export class DeliverableTwoGrader implements Grader {
  async grade(user: User): Promise<number> {
    const hostname = user.website;
    const workflows = new Workflows();
    let score = 0;

    if (!hostname) {
      console.error('No hostname found for user:', user.netId);
      return score;
    }

    const repo = 'jwt-pizza';

    // Read workflow file
    const workflowFileContents = await workflows.readWorkflowFile(user, repo);
    const deployedToPages = workflowFileContents.includes('actions/deploy-pages');
    if (!deployedToPages) {
      console.error('Not deployed to pages');
      return score;
    }
    score += 30;

    // Trigger the action and wait for it to complete
    await workflows.triggerWorkflow(user, repo);
    await workflows.waitForCompletion(user, repo);

    // Check for successful deployment
    const deliverableOne = new DeliverableOneGrader();
    const deployedScore = await deliverableOne.grade(user);
    score += deployedScore * 0.7;

    return score;
  }
}
