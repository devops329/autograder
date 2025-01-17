// import { DeliverableOne } from '../../grading/graders/DeliverableOne';
// import { DeliverableTwo } from '../../grading/graders/DeliverableTwo';
// import { MockGithub } from '../mock/grading/mockGithub';
// import { MockGradingTools } from '../mock/grading/mockGradingTools';
// import { mockStudent, mockStudentNoWebsiteOrGithub } from '../mock/mockValues';

// const mockGithub = new MockGithub();
// const mockTools = new MockGradingTools();
// const d1 = new DeliverableOne(mockTools);
// const d2 = new DeliverableTwo(d1, mockGithub);

// // All these tests assume Deliverable One gets full points
// beforeEach(() => {
//   mockGithub.workflowRuns = true;
// });

// test('A student with no website gets 0 points', async () => {
//   const [score, rubric] = await d2.grade(mockStudentNoWebsiteOrGithub, '1');
//   expect(score).toBe(0);
//   expect(rubric.deployedToPages).toBe(0);
//   expect(rubric.deployedScore).toBe(0);
//   expect(rubric.comments).toBe('No website provided.\n');
// });

// test('A workflow that does not deploy to GitHub Pages gets 0 points', async () => {
//   mockGithub.workflowFileContents = 'not deploying to pages';
//   const [score, rubric] = await d2.grade(mockStudent, '1');
//   expect(score).toBe(0);
//   expect(rubric.deployedToPages).toBe(0);
//   expect(rubric.deployedScore).toBe(0);
//   expect(rubric.comments).toBe('Your GitHub Action workflow does not deploy to GitHub Pages.\n');
// });

// test('A workflow that has the action to deploy to GitHub Pages but does not run gets 30 points', async () => {
//   mockGithub.workflowFileContents = 'actions/deploy-pages';
//   mockGithub.workflowRuns = false;
//   const [score, rubric] = await d2.grade(mockStudent, '1');
//   expect(score).toBe(30);
//   expect(rubric.deployedToPages).toBe(30);
//   expect(rubric.deployedScore).toBe(0);
//   expect(rubric.comments).toBe('Workflow could not be triggered. Did you add byucs329ta as a collaborator?\n');
// });

// test('A workflow that deploys to GitHub Pages and runs successfully gets 100 points', async () => {
//   mockGithub.workflowFileContents = 'actions/deploy-pages';
//   const [score, rubric] = await d2.grade(mockStudent, '1');
//   expect(score).toBe(100);
//   expect(rubric.deployedToPages).toBe(30);
//   expect(rubric.deployedScore).toBe(70);
//   expect(rubric.comments).toBe('');
// });
