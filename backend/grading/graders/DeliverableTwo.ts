import { User } from '../../model/domain/User';
import { DeliverableOne } from './DeliverableOne';
import { Grader } from './Grader';
import { Github } from '../tools/Github';

interface Rubric {
  deployedToPages: number;
  deployedScore: number;
}

export class DeliverableTwo implements Grader {
  async grade(user: User): Promise<[number, object]> {
    const rubric: Rubric = {
      deployedToPages: 0,
      deployedScore: 0,
    };
    const hostname = user.website;
    const github = new Github(user, 'jwt-pizza');
    let score = 0;

    if (!hostname) {
      console.error('No hostname found for user:', user.netId);
      return [score, rubric];
    }

    // Read workflow file
    const workflowFileContents = await github.readWorkflowFile();
    const deployedToPages = workflowFileContents.includes('actions/deploy-pages');
    if (!deployedToPages) {
      console.error('Not deployed to pages');
      return [score, rubric];
    }
    score += 30;
    rubric.deployedToPages = 30;

    // Trigger the action and wait for it to complete
    await github.triggerWorkflow();

    // Check for successful deployment
    const deliverableOne = new DeliverableOne();
    const deployedScore = (await deliverableOne.grade(user))[0] * 0.7;
    score += deployedScore;
    rubric.deployedScore = deployedScore;

    return [score, rubric];
  }
}
