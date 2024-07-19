import { User } from '../../model/domain/User';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

/*
| Percent | Item                                                    |
| ------- | ------------------------------------------------------- |
| 20%     | Secure Fargate deployment based on ECR and ECS          |
| 20%     | AWS Load balancer used to access Fargate                |
| 20%     | MySQL database deployed for backend data persistence    |
| 30%     | Updated GitHub Action workflow deploying to ECR and ECS |
| 10%     | Your backend called for all frontend requests           |
*/
interface Rubric {
  ecrEcsFargateDeployment: number;
  awsLoadBalancer: number;
  mySQLDatabase: number;
  githubActionWorkflow: number;
  ownBackendCalledForFrontendRequests: number;
}

export class DeliverableSix implements Grader {
  async grade(user: User): Promise<[number, object]> {
    let score = 0;
    const rubric: Rubric = {
      ecrEcsFargateDeployment: 0,
      awsLoadBalancer: 0,
      mySQLDatabase: 0,
      githubActionWorkflow: 0,
      ownBackendCalledForFrontendRequests: 0,
    };
    const github = new Github(user, 'jwt-pizza');
    const tools = new GradingTools();

    // Read workflow file
    const workflowFile = await github.readWorkflowFile();
    const pushesToECS = workflowFile.includes('aws-actions/amazon-ecs-deploy-task-definition');
    const buildsAndPushesToECR = workflowFile.includes('docker build') && workflowFile.includes('$ECR_REGISTRY/$ECR_REPOSITORY --push');

    // Run the workflow
    await github.triggerWorkflowAndWaitForCompletion('ci.yml');

    // Check for successful run
    const runSuccess = await github.checkRecentRunSuccess('ci.yml');
    if (pushesToECS && buildsAndPushesToECR && runSuccess) {
      score += 20;
      rubric.ecrEcsFargateDeployment += 20;
      rubric.githubActionWorkflow += 20;
    }

    // Check DNS
    const deployedWithELB = await tools.checkDNS(user.website, /elb\.amazonaws\.com/);
    if (deployedWithELB) {
      score += 20;
      rubric.awsLoadBalancer += 20;
    }

    // Get service url
    const envFile = await github.readGithubFile('.env.production');
    const serviceUrl = await tools.getEnvVariable(envFile, 'SERVICE_URL');
    const usingOwnService = !serviceUrl.includes('cs329.click');

    // Use curl to create a user and then login in as the user
    if (usingOwnService) {
      const serviceWorks = await tools.createUserAndLogin(serviceUrl);
      if (serviceWorks) {
        score += 30;
        rubric.ownBackendCalledForFrontendRequests += 10;
        rubric.mySQLDatabase += 20;
      }
    }

    return [score, rubric];
  }
}
