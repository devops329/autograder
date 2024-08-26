import { DeliverableSeven } from '../../grading/graders/DeliverableSeven';
import { MockGithub } from '../mock/grading/mockGithub';
import { MockGradingTools } from '../mock/grading/mockGradingTools';
import { mockRelease, mockRelease2, mockStudent, mockVersionJson, mockVersionJson2 } from '../mock/mockValues';

const mockTools = new MockGradingTools();
const mockGithub = new MockGithub();
const d7 = new DeliverableSeven(mockTools, mockGithub);

beforeEach(() => {
  mockGithub.workflowFileContents = '';
  mockGithub.workflowRuns = true;
  mockGithub.workflowSuccess = true;
  mockGithub.createNewStagingRelease = true;
  mockGithub.failSecondWorkflowTrigger = false;
  mockGithub.failSecondWorkflowCompletion = false;
  mockGithub.releaseNumber = mockRelease;
  mockGithub.createProductionRelease = false;
  mockTools.updatePageJson = false;
});

test('A workflow that does not push latest version to s3 gets 0 points', async () => {
  mockGithub.workflowFileContents = 'I did not read the instructions';
  const [score, rubric] = await d7.grade(mockStudent, '1');
  expect(score).toBe(0);
  expect(rubric.versionArchiveInS3).toBe(0);
  expect(rubric.comments).toBe('Workflow does not push latest version to S3.\n');
});

test('A workflow that pushes latest version to s3 but fails to run or deploy staging successfully gets 10 points', async () => {
  mockGithub.workflowFileContents = 'aws s3 cp dist s3://my-bucket/$version';
  mockGithub.workflowRuns = false;
  const [score, rubric] = await d7.grade(mockStudent, '1');
  expect(score).toBe(10);
  expect(rubric.versionArchiveInS3).toBe(10);
  expect(rubric.continuousStagingDeployment).toBe(0);
  expect(rubric.comments).toBe('Staging workflow could not be triggered. Did you add byucs329ta as a collaborator?\n');

  mockGithub.workflowRuns = true;
  mockGithub.workflowSuccess = false;
  const [score2, rubric2] = await d7.grade(mockStudent, '1');
  expect(score2).toBe(10);
  expect(rubric2.versionArchiveInS3).toBe(10);
  expect(rubric2.continuousStagingDeployment).toBe(0);
  expect(rubric2.comments).toBe('Staging deployment failed.\n');
});

test('A workflow that pushes latest version to s3 and runs successfully, but fails everything else gets 20 points', async () => {
  mockGithub.workflowFileContents = 'aws s3 cp dist s3://my-bucket/$version';
  mockGithub.createNewStagingRelease = false;
  const [score, rubric] = await d7.grade(mockStudent, '1');
  expect(score).toBe(20);
  expect(rubric.versionArchiveInS3).toBe(20);
  expect(rubric.continuousStagingDeployment).toBe(0);
  expect(rubric.comments).toBe('Staging workflow does not run on push.\nStaging deployment did not create a new release.\n');
});

test('A successful workflow with s3 push and on-push trigger that does not create a new release gets 30 points', async () => {
  mockGithub.workflowFileContents = 'push:\naws s3 cp dist s3://my-bucket/$version';
  mockGithub.createNewStagingRelease = false;
  const [score, rubric] = await d7.grade(mockStudent, '1');
  expect(score).toBe(30);
  expect(rubric.versionArchiveInS3).toBe(20);
  expect(rubric.continuousStagingDeployment).toBe(10);
  expect(rubric.comments).toBe('Staging deployment did not create a new release.\n');
});

test('A successful workflow that creates a new release but fails further requirements gets 40 points', async () => {
  mockGithub.workflowFileContents = 'push:\naws s3 cp dist s3://my-bucket/$version';
  mockGithub.failSecondWorkflowTrigger = true;
  const [score, rubric] = await d7.grade(mockStudent, '1');
  expect(score).toBe(40);
  expect(rubric.versionArchiveInS3).toBe(20);
  expect(rubric.continuousStagingDeployment).toBe(10);
  expect(rubric.githubReleases).toBe(10);
  expect(rubric.comments).toBe(
    'Staging release version does not match staging site version.\nProduction workflow could not be triggered. Did you add byucs329ta as a collaborator?\n'
  );
});

test('A successful staging deployment but unsuccessful production deployment gets 60 points', async () => {
  mockGithub.workflowFileContents = 'push:\naws s3 cp dist s3://my-bucket/$version';
  mockGithub.failSecondWorkflowTrigger = true;
  mockTools.pageJson = mockVersionJson2;
  const [score, rubric] = await d7.grade(mockStudent, '1');
  expect(score).toBe(60);
  expect(rubric.versionArchiveInS3).toBe(20);
  expect(rubric.continuousStagingDeployment).toBe(30);
  expect(rubric.githubReleases).toBe(10);
  expect(rubric.comments).toBe('Production workflow could not be triggered. Did you add byucs329ta as a collaborator?\n');

  mockGithub.workflowRuns = true;
  mockGithub.workflowSuccess = true;
  mockGithub.failSecondWorkflowTrigger = false;
  mockGithub.failSecondWorkflowCompletion = true;
  mockGithub.createNewStagingRelease = true;
  mockTools.pageJson = mockVersionJson;
  const [score2, rubric2] = await d7.grade(mockStudent, '1');
  expect(score2).toBe(60);
  expect(rubric2.versionArchiveInS3).toBe(20);
  expect(rubric2.continuousStagingDeployment).toBe(30);
  expect(rubric2.githubReleases).toBe(10);
  expect(rubric2.comments).toBe('Production deployment failed.\n');
});

test('A production workflow that runs successfully but does not create a release gets 70 points', async () => {
  mockGithub.workflowFileContents = 'push:\naws s3 cp dist s3://my-bucket/$version';
  mockTools.pageJson = mockVersionJson2;
  const [score, rubric] = await d7.grade(mockStudent, '1');
  expect(score).toBe(70);
  expect(rubric.versionArchiveInS3).toBe(20);
  expect(rubric.continuousStagingDeployment).toBe(30);
  expect(rubric.githubReleases).toBe(10);
  expect(rubric.triggeredProductionDeployment).toBe(10);
  expect(rubric.comments).toBe('Production release not created.\n');
});

test('A production workflow that runs successfully but release number does not match site version number gets 80 points', async () => {
  mockGithub.workflowFileContents = 'push:\naws s3 cp dist s3://my-bucket/$version';
  mockTools.pageJson = mockVersionJson2;
  mockGithub.createProductionRelease = true;
  const [score, rubric] = await d7.grade(mockStudent, '1');
  expect(score).toBe(80);
  expect(rubric.versionArchiveInS3).toBe(20);
  expect(rubric.continuousStagingDeployment).toBe(30);
  expect(rubric.githubReleases).toBe(20);
  expect(rubric.triggeredProductionDeployment).toBe(10);
  expect(rubric.comments).toBe('Production release version does not match production site version\n');
});

test('A successful production deployment gets 100 points', async () => {
  mockGithub.workflowFileContents = 'push:\naws s3 cp dist s3://my-bucket/$version';
  mockTools.pageJson = mockVersionJson2;
  mockTools.updatePageJson = true;
  mockGithub.createProductionRelease = true;
  const [score, rubric] = await d7.grade(mockStudent, '1');
  expect(score).toBe(100);
  expect(rubric.versionArchiveInS3).toBe(20);
  expect(rubric.continuousStagingDeployment).toBe(30);
  expect(rubric.githubReleases).toBe(20);
  expect(rubric.triggeredProductionDeployment).toBe(30);
  expect(rubric.comments).toBe('');
});
