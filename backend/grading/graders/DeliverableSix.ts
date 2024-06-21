import { User } from '../../model/domain/User';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

export class DeliverableSix implements Grader {
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

    // Check DNS
    const deployedWithELB = await tools.checkDNS(user.website, /elb\.amazonaws\.com/);
    if (deployedWithELB) score += 20;

    // Get service url
    const envFile = await tools.readGithubFile(user, 'jwt-pizza', '.env.production');
    const envVars = envFile.split('\n');
    let serviceUrl = '';
    for (const envVar of envVars) {
      const [envKey, value] = envVar.split('=');
      if (envKey.trim() === 'VITE_PIZZA_SERVICE_URL') {
        serviceUrl = value.trim();
      }
    }
    const usingOwnService = !serviceUrl.includes('cs329.click');

    // Use curl to create a user and then login in as the user
    if (usingOwnService) {
      const serviceWorks = await tools.createUserAndLogin(serviceUrl);
      if (serviceWorks) score += 40;
    }

    return score;
  }
}
