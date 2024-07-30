import { User } from '../../model/domain/User';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

interface Rubric {
  ecrEcsFargateDeployment: number;
  awsLoadBalancer: number;
  mySQLDatabase: number;
  githubActionWorkflow: number;
  frontendCallsOwnFunctionalService: number;
  comments: string;
}

export class DeliverableSix implements Grader {
  async grade(user: User, gradeAttemptId: string): Promise<[number, object]> {
    let score = 0;
    const rubric: Rubric = {
      ecrEcsFargateDeployment: 0,
      awsLoadBalancer: 0,
      mySQLDatabase: 0,
      githubActionWorkflow: 0,
      frontendCallsOwnFunctionalService: 0,
      comments: '',
    };
    const github = new Github(user, 'jwt-pizza-service');
    const tools = new GradingTools();

    // Read workflow file
    const workflowFile = await github.readWorkflowFile(gradeAttemptId);
    const pushesToECS = workflowFile.includes('aws-actions/amazon-ecs-deploy-task-definition');
    const buildsAndPushesToECR = workflowFile.includes('docker build') && workflowFile.includes('$ECR_REGISTRY/$ECR_REPOSITORY --push');

    if (pushesToECS && buildsAndPushesToECR) {
      // Run the workflow
      const success = await github.triggerWorkflowAndWaitForCompletion('ci.yml', gradeAttemptId);
      if (!success) {
        rubric.comments += 'Workflow could not be triggered. Did you add byucs329ta as a collaborator?\n';
        return [score, rubric];
      }

      // Check for successful run
      const runSuccess = await github.checkRecentRunSuccess('ci.yml', gradeAttemptId);
      if (runSuccess) {
        score += 50;
        rubric.ecrEcsFargateDeployment += 20;
        rubric.githubActionWorkflow += 30;
      } else {
        rubric.comments += 'Your GitHub Action workflow did not complete successfully.\n';
      }

      // Get service url from frontend
      github.setRepo('jwt-pizza');
      const envFile = await github.readGithubFile('.env.production', gradeAttemptId);
      const serviceUrl = await tools.getEnvVariable(envFile, 'VITE_PIZZA_SERVICE_URL');
      if (!serviceUrl) {
        rubric.comments += 'Could not find VITE_PIZZA_SERVICE_URL in .env.production.\n';
        return [score, rubric];
      }
      const usingOwnService = !serviceUrl.includes('cs329.click');

      if (usingOwnService) {
        // Check if service deployed with load balancer
        const service = serviceUrl.replace('https://', '');
        const deployedWithELB = await tools.checkDNS(service, /elb\.amazonaws\.com/, gradeAttemptId);
        if (deployedWithELB) {
          score += 20;
          rubric.awsLoadBalancer += 20;
        } else {
          rubric.comments += 'Your website is not deployed with an AWS Load Balancer.\n';
        }
        // Check that service is functional
        const serviceWorks = await tools.createUserAndLogin(serviceUrl, gradeAttemptId);
        if (serviceWorks) {
          score += 30;
          rubric.frontendCallsOwnFunctionalService += 10;
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
