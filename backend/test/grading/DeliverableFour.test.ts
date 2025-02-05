import { DeliverableFour } from '../../grading/graders/DeliverableFour';
import { MockGithub } from '../mock/grading/mockGithub';
import { MockGradingTools } from '../mock/grading/mockGradingTools';
import { mockStudent } from '../mock/mockValues';

const mockTools = new MockGradingTools();
const mockGithub = new MockGithub();
const d4 = new DeliverableFour(mockTools, mockGithub);

beforeEach(() => {
  mockGithub.workflowRuns = true;
  mockGithub.workflowSuccess = true;
  mockGithub.incrementVersion = false;
  mockGithub.workflowFileContents = '';
  mockGithub.versionNumber = '1.0.0';
  mockTools.coverage = false;
});

test('A workflow without testing gets 0 points', async () => {
  mockGithub.workflowFileContents = 'I didnt read the instructions';
  const [score, rubric] = await d4.grade(mockStudent, '0');
  expect(score).toBe(0);
  expect(rubric.testSuccess).toBe(0);
  expect(rubric.coverage).toBe(0);
  expect(rubric.comments).toBe('Testing is not included in the workflow.\n');
});

test('A workflow with testing that does not run gets 5 points', async () => {
  mockGithub.workflowFileContents = 'npm run test:coverage';
  mockGithub.workflowRuns = false;
  let [score, rubric] = await d4.grade(mockStudent, '0');
  expect(score).toBe(5);
  expect(rubric.testSuccess).toBe(5);
  expect(rubric.coverage).toBe(0);
  expect(rubric.comments).toBe('Workflow could not be triggered. Did you add byucs329ta as a collaborator?\n');
});

test('A workflow with testing that runs but does not succeed gets 10 points', async () => {
  mockGithub.workflowFileContents = 'npm run test:coverage';
  mockGithub.workflowSuccess = false;
  const [score, rubric] = await d4.grade(mockStudent, '0');
  expect(score).toBe(5);
  expect(rubric.testSuccess).toBe(5);
  expect(rubric.coverage).toBe(0);
  expect(rubric.comments).toBe('Workflow did not succeed.\n');
});

test('A workflow with testing that runs but does not create coverage gets 20 points', async () => {
  mockGithub.workflowFileContents = 'npm run test:coverage';
  const [score, rubric] = await d4.grade(mockStudent, '0');
  expect(score).toBe(20);
  expect(rubric.testSuccess).toBe(20);
  expect(rubric.coverage).toBe(0);
  expect(rubric.comments).toBe('Version number was not incremented.\nCoverage did not exceed minimum threshold.\n');
});

test('Testing workflow that succeeds but does not have sufficient coverage gets 30 points', async () => {
  mockGithub.workflowFileContents = 'npm run test:coverage';
  mockGithub.incrementVersion = true;
  const [score, rubric] = await d4.grade(mockStudent, '0');
  expect(score).toBe(30);
  expect(rubric.testSuccess).toBe(20);
  expect(rubric.coverage).toBe(0);
  expect(rubric.comments).toBe('Coverage did not exceed minimum threshold.\n');
});

test('A complete workflow that succeeds gets 100 points', async () => {
  mockGithub.workflowFileContents = 'npm run test:coverage';
  mockGithub.incrementVersion = true;
  mockTools.coverage = true;
  const [score, rubric] = await d4.grade(mockStudent, '0');
  expect(score).toBe(100);
  expect(rubric.testSuccess).toBe(20);
  expect(rubric.coverage).toBe(70);
  expect(rubric.comments).toBe('');
});
