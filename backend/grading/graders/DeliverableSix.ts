import { User } from '../../model/domain/User';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

export class DeliverableFive implements Grader {
  async grade(user: User): Promise<number> {
    let score = 0;
    const tools = new GradingTools();

    // Read workflow file
    const workflowFile = await tools.readWorkflowFile(user, 'jwt-pizza');
    const pushesToECS = workflowFile.includes('aws-actions/amazon-ecs-deploy-task-definition');
    const buildsAndPushesToECR = workflowFile.includes('docker build') && workflowFile.includes('$ECR_REGISTRY/$ECR_REPOSITORY --push');

    // Run the workflow
    await tools.triggerWorkflow(user, 'jwt-pizza');

    // Check for successful run
    const run = await tools.getMostRecentRun(user, 'jwt-pizza');
    if (pushesToECS && buildsAndPushesToECR && run.conclusion === 'success') score += 40;

    return score;
  }
}
