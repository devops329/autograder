import logger from '../../logger';
import { User } from '../../model/domain/User';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

interface Rubric {
  ecrEcsFargateDeployment: number;
  awsLoadBalancer: number;
  mySQLDatabase: number;
  githubActionWorkflow: number;
  ownBackendCalledForFrontendRequests: number;
  comments: string;
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
      comments: '',
    };
    const github = new Github(user, 'jwt-pizza-service');
    const tools = new GradingTools();

    // Read workflow file
    const workflowFile = await github.readWorkflowFile();
    const pushesToECS = workflowFile.includes('aws-actions/amazon-ecs-deploy-task-definition');
    const buildsAndPushesToECR = workflowFile.includes('docker build') && workflowFile.includes('$ECR_REGISTRY/$ECR_REPOSITORY --push');

    if (pushesToECS && buildsAndPushesToECR) {
      // Run the workflow
      await github.triggerWorkflowAndWaitForCompletion('ci.yml');

      // Check for successful run
      const runSuccess = await github.checkRecentRunSuccess('ci.yml');
      if (runSuccess) {
        score += 50;
        rubric.ecrEcsFargateDeployment += 20;
        rubric.githubActionWorkflow += 30;
      } else {
        rubric.comments += 'Your GitHub Action workflow did not complete successfully.\n';
      }

      // Check DNS
      const deployedWithELB = await tools.checkDNS(user.website, /elb\.amazonaws\.com/);
      if (deployedWithELB) {
        score += 20;
        rubric.awsLoadBalancer += 20;
      } else {
        rubric.comments += 'Your website is not deployed with an AWS Load Balancer.\n';
      }

      // Get service url from frontend
      github.setRepo('jwt-pizza');
      const envFile = await github.readGithubFile('.env.production');
      const serviceUrl = await tools.getEnvVariable(envFile, 'VITE_PIZZA_SERVICE_URL');
      if (!serviceUrl) {
        rubric.comments += 'Could not find VITE_PIZZA_SERVICE_URL in .env.production.\n';
        return [score, rubric];
      }
      const usingOwnService = !serviceUrl.includes('cs329.click');

      // Use curl to create a user and then login in as the user
      if (usingOwnService) {
        const serviceWorks = await tools.createUserAndLogin(serviceUrl);
        if (serviceWorks) {
          score += 30;
          rubric.ownBackendCalledForFrontendRequests += 10;
          rubric.mySQLDatabase += 20;
        } else {
          rubric.comments += 'Your service does not work as expected.\n';
        }
      } else {
        rubric.comments += 'You are using the provided service URL.';
      }
    } else {
      rubric.comments += 'Your GitHub Action workflow does not build and push to ECR and deploy to ECS.\n';
    }

    return [score, rubric];
  }
}
