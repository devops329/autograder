import { DeliverableFive } from '../../grading/graders/DeliverableFive';
import { MockGithub } from '../mock/grading/mockGithub';
import { MockGradingTools } from '../mock/grading/mockGradingTools';
import { mockStudent } from '../mock/mockValues';

const mockTools = new MockGradingTools();
const mockGithub = new MockGithub();
const d5 = new DeliverableFive(mockTools, mockGithub);

beforeEach(() => {
  mockGithub.workflowFileContents = '';
  mockGithub.workflowRuns = true;
  mockGithub.workflowSuccess = true;
  mockTools.pageExists = true;
  mockTools.success404 = true;
  mockTools.dnsSuccess = true;
});

test('A workflow without successful S3 deployment gets 0 points', async () => {
  mockGithub.workflowFileContents = 'I didnt read the instructions';
  let [score, rubric] = await d5.grade(mockStudent, '0');
  expect(score).toBe(0);
  expect(rubric.pushesToS3).toBe(0);
  expect(rubric.cloudfrontDeployment).toBe(0);
  expect(rubric.handles404Routing).toBe(0);
  expect(rubric.comments).toBe('Workflow does not push to S3.\n');

  mockGithub.workflowFileContents = 'aws s3 cp';
  mockGithub.workflowRuns = false;
  [score, rubric] = await d5.grade(mockStudent, '0');
  expect(score).toBe(0);
  expect(rubric.comments).toBe('Workflow could not be triggered. Did you add byucs329ta as a collaborator?\n');

  mockGithub.workflowRuns = true;
  mockGithub.workflowSuccess = false;
  [score, rubric] = await d5.grade(mockStudent, '0');
  expect(score).toBe(0);
  expect(rubric.comments).toBe('Workflow did not complete successfully.\n');
});

test('Successful s3 push without cloudfront deployment gets 45 points', async () => {
  mockGithub.workflowFileContents = 'aws s3 cp';
  mockGithub.workflowRuns = true;
  mockGithub.workflowSuccess = true;
  mockTools.success404 = false;
  mockTools.dnsSuccess = false;
  mockTools.pageExists = false;
  const [score, rubric] = await d5.grade(mockStudent, '0');
  expect(score).toBe(45);
  expect(rubric.pushesToS3).toBe(45);
  expect(rubric.cloudfrontDeployment).toBe(0);
  expect(rubric.handles404Routing).toBe(0);
  expect(rubric.comments).toBe('Cloudfront deployment failed.\n');
});

test('Successful s3 push with cloudfront deployment bit no 404 routing gets 90 points', async () => {
  mockGithub.workflowFileContents = 'aws s3 cp';
  mockGithub.workflowRuns = true;
  mockGithub.workflowSuccess = true;
  mockTools.dnsSuccess = true;
  mockTools.pageExists = true;
  mockTools.success404 = false;
  const [score, rubric] = await d5.grade(mockStudent, '0');
  expect(score).toBe(90);
  expect(rubric.pushesToS3).toBe(45);
  expect(rubric.cloudfrontDeployment).toBe(45);
  expect(rubric.handles404Routing).toBe(0);
  expect(rubric.comments).toBe('404 routing failed.\n');
});

test('Successful s3 push with cloudfront deployment and 404 routing gets 100 points', async () => {
  mockGithub.workflowFileContents = 'aws s3 cp';
  mockGithub.workflowRuns = true;
  mockGithub.workflowSuccess = true;
  mockTools.dnsSuccess = true;
  mockTools.pageExists = true;
  const [score, rubric] = await d5.grade(mockStudent, '0');
  expect(score).toBe(100);
  expect(rubric.pushesToS3).toBe(45);
  expect(rubric.cloudfrontDeployment).toBe(45);
  expect(rubric.handles404Routing).toBe(10);
  expect(rubric.comments).toBe('');
});
