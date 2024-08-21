import e from 'express';
import { DeliverableSix } from '../../grading/graders/DeliverableSix';
import { MockGithub } from '../mock/grading/mockGithub';
import { MockGradingTools } from '../mock/grading/mockGradingTools';
import { mockStudent } from '../mock/mockValues';

const mockTools = new MockGradingTools();
const mockGithub = new MockGithub();
const d6 = new DeliverableSix(mockTools, mockGithub);

beforeEach(() => {
  mockGithub.workflowFileContents = '';
  mockTools.dnsSuccess = true;
  mockTools.envVariable = 'http://pizza-service.hostname.mock';
  mockTools.serviceWorks = true;
  mockGithub.workflowRuns = true;
  mockGithub.workflowSuccess = true;
});

test('A workflow that cannot be triggered or does not succeed gets 0 points', async () => {
  mockGithub.workflowFileContents = 'docker build\n$ECR_REGISTRY/$ECR_REPOSITORY --push\naws-actions/amazon-ecs-deploy-task-definition';
  mockGithub.workflowRuns = false;
  const [score, rubric] = await d6.grade(mockStudent, '1');
  expect(score).toBe(0);
  expect(rubric.ecrEcsFargateDeployment).toBe(0);
  expect(rubric.githubActionWorkflow).toBe(0);
  expect(rubric.comments).toContain('Workflow could not be triggered. Did you add byucs329ta as a collaborator?\n');

  mockGithub.workflowRuns = true;
  mockGithub.workflowSuccess = false;
  const [score2, rubric2] = await d6.grade(mockStudent, '1');
  expect(score2).toBe(0);
  expect(rubric2.ecrEcsFargateDeployment).toBe(0);
  expect(rubric2.githubActionWorkflow).toBe(0);
  expect(rubric2.comments).toContain('Your GitHub Action workflow did not complete successfully.\n');
});

test('A workflow that does not push to ECR or ECS gets 0 points', async () => {
  mockGithub.workflowFileContents = 'I did not read the instructions';
  const [score, rubric] = await d6.grade(mockStudent, '1');
  expect(score).toBe(0);
  expect(rubric.ecrEcsFargateDeployment).toBe(0);
  expect(rubric.githubActionWorkflow).toBe(0);
  expect(rubric.comments).toContain('Your GitHub Action workflow does not build and push to ECR and deploy to ECS.\n');
});

test('A workflow that pushes to ECR but not ECS gets 0 points', async () => {
  mockGithub.workflowFileContents = 'docker build\n$ECR_REGISTRY/$ECR_REPOSITORY --push';
  const [score, rubric] = await d6.grade(mockStudent, '1');
  expect(score).toBe(0);
  expect(rubric.ecrEcsFargateDeployment).toBe(0);
  expect(rubric.githubActionWorkflow).toBe(0);
  expect(rubric.comments).toContain('Your GitHub Action workflow does not build and push to ECR and deploy to ECS.\n');
});

test('A workflow that pushes to ECR and ECS, runs successfully but does not deploy with load balancer or function gets 50 points', async () => {
  mockGithub.workflowFileContents = 'docker build\n$ECR_REGISTRY/$ECR_REPOSITORY --push\naws-actions/amazon-ecs-deploy-task-definition';
  mockTools.dnsSuccess = false;
  const [score, rubric] = await d6.grade(mockStudent, '1');
  expect(score).toBe(50);
  expect(rubric.ecrEcsFargateDeployment).toBe(20);
  expect(rubric.githubActionWorkflow).toBe(30);
  expect(rubric.comments).toContain('Your service is not deployed with a load balancer.\n');
});

test('A service deployed with load balancer but missing environment variable gets 70 points', async () => {
  mockGithub.workflowFileContents = 'docker build\n$ECR_REGISTRY/$ECR_REPOSITORY --push\naws-actions/amazon-ecs-deploy-task-definition';
  mockTools.envVariable = '';
  const [score, rubric] = await d6.grade(mockStudent, '1');
  expect(score).toBe(70);
  expect(rubric.ecrEcsFargateDeployment).toBe(20);
  expect(rubric.githubActionWorkflow).toBe(30);
  expect(rubric.awsLoadBalancer).toBe(20);
  expect(rubric.comments).toContain('Could not find VITE_PIZZA_SERVICE_URL in jwt-pizza .env.production.\n');
});

test('A functional service deployed with load balancer gets 100 points', async () => {
  mockGithub.workflowFileContents = 'docker build\n$ECR_REGISTRY/$ECR_REPOSITORY --push\naws-actions/amazon-ecs-deploy-task-definition';
  const [score, rubric] = await d6.grade(mockStudent, '1');
  expect(score).toBe(100);
  expect(rubric.ecrEcsFargateDeployment).toBe(20);
  expect(rubric.githubActionWorkflow).toBe(30);
  expect(rubric.awsLoadBalancer).toBe(20);
  expect(rubric.mySQLDatabase).toBe(20);
  expect(rubric.frontendCallsOwnFunctionalService).toBe(10);
  expect(rubric.comments).toBe('');
});

test('A successful deployment but front end uses the class service gets 70 points', async () => {
  mockGithub.workflowFileContents = 'docker build\n$ECR_REGISTRY/$ECR_REPOSITORY --push\naws-actions/amazon-ecs-deploy-task-definition';
  mockTools.envVariable = 'http://cs329.click';
  const [score, rubric] = await d6.grade(mockStudent, '1');
  expect(score).toBe(70);
  expect(rubric.ecrEcsFargateDeployment).toBe(20);
  expect(rubric.githubActionWorkflow).toBe(30);
  expect(rubric.awsLoadBalancer).toBe(20);
  expect(rubric.comments).toContain('You are using the default service URL.\n');
});

test('A successful deployment but service does not work gets 70 points', async () => {
  mockGithub.workflowFileContents = 'docker build\n$ECR_REGISTRY/$ECR_REPOSITORY --push\naws-actions/amazon-ecs-deploy-task-definition';
  mockTools.serviceWorks = false;
  const [score, rubric] = await d6.grade(mockStudent, '1');
  expect(score).toBe(70);
  expect(rubric.ecrEcsFargateDeployment).toBe(20);
  expect(rubric.githubActionWorkflow).toBe(30);
  expect(rubric.awsLoadBalancer).toBe(20);
  expect(rubric.comments).toContain('Your service does not work as expected.\n');
});
