import { DeliverableThree } from '../../grading/graders/DeliverableThree';
import { MockGithub } from '../mock/grading/mockGithub';
import { MockGradingTools } from '../mock/grading/mockGradingTools';
import { mockStudent } from '../mock/mockValues';

const mockTools = new MockGradingTools();
const mockGithub = new MockGithub();
const d3 = new DeliverableThree(mockTools, mockGithub);

beforeEach(() => {
  mockGithub.workflowRuns = true;
  mockGithub.workflowSuccess = true;
  mockGithub.incrementVersion = false;
  mockGithub.workflowFileContents = '';
  mockGithub.versionNumber = '1.0.0';
  mockTools.coverage = false;
});

test('A workflow with linting but nothing else gets 5 points', async () => {
  mockGithub.workflowFileContents = 'npm run lint';
  const [score, rubric] = await d3.grade(mockStudent, '0');
  expect(score).toBe(5);
  expect(rubric.lintSuccess).toBe(5);
  expect(rubric.testSuccess).toBe(0);
  expect(rubric.coverage).toBe(0);
  expect(rubric.comments).toBe('Testing is not included in the workflow.\n');
});

test('A workflow with testing that does not run gets 5 points', async () => {
  mockGithub.workflowFileContents = 'npm run test';
  mockGithub.workflowRuns = false;
  let [score, rubric] = await d3.grade(mockStudent, '0');
  expect(score).toBe(5);
  expect(rubric.lintSuccess).toBe(0);
  expect(rubric.testSuccess).toBe(5);
  expect(rubric.coverage).toBe(0);
  expect(rubric.comments).toBe(
    'Linting is not included in the workflow.\nWorkflow could not be triggered. Did you add byucs329ta as a collaborator?\n'
  );
  // Check both ways to run test script
  mockGithub.workflowFileContents = 'npm test';
  [score, rubric] = await d3.grade(mockStudent, '0');
  expect(score).toBe(5);
  expect(rubric.lintSuccess).toBe(0);
  expect(rubric.testSuccess).toBe(5);
});

test('A workflow with testing and linting that runs but does not succeed gets 10 points', async () => {
  mockGithub.workflowFileContents = 'npm run lint\nnpm run test';
  mockGithub.workflowSuccess = false;
  const [score, rubric] = await d3.grade(mockStudent, '0');
  expect(score).toBe(10);
  expect(rubric.lintSuccess).toBe(5);
  expect(rubric.testSuccess).toBe(5);
  expect(rubric.coverage).toBe(0);
  expect(rubric.comments).toBe('Workflow did not succeed.\n');
});

test('A workflow with linting and testing that succeeds but does not create coverage gets 30 points', async () => {
  mockGithub.workflowFileContents = 'npm run lint\nnpm run test';
  const [score, rubric] = await d3.grade(mockStudent, '0');
  expect(score).toBe(30);
  expect(rubric.lintSuccess).toBe(10);
  expect(rubric.testSuccess).toBe(20);
  expect(rubric.coverage).toBe(0);
  expect(rubric.comments).toBe('Coverage did not exceed minimum threshold.\n');
});

test('A complete workflow that succeeds gets 100 points', async () => {
  mockGithub.workflowFileContents = 'npm run lint\nnpm run test';
  mockGithub.incrementVersion = true;
  mockTools.coverage = true;
  const [score, rubric] = await d3.grade(mockStudent, '0');
  expect(score).toBe(100);
  expect(rubric.lintSuccess).toBe(10);
  expect(rubric.testSuccess).toBe(20);
  expect(rubric.coverage).toBe(70);
  expect(rubric.comments).toBe('');
});
