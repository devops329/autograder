import { DeliverableOne } from '../../grading/graders/DeliverableOne';
import { MockGradingTools } from '../mock/grading/mockGradingTools';
import { mockStudent, mockStudentNoWebsiteOrGithub } from '../mock/mockValues';

const mockTools = new MockGradingTools();
const d1 = new DeliverableOne(mockTools);

test('A student with no website gets 0 points', async () => {
  const mockStudent = mockStudentNoWebsiteOrGithub;
  const [score, rubric] = await d1.grade(mockStudent, '1');
  expect(score).toBe(0);
  expect(rubric.customDomainName).toBe(0);
  expect(rubric.comments).toBe('No website provided.\n');
});

test('A successful deployment with github pages and custom domain gets 100 points', async () => {
  mockTools.pageExists = true;
  mockTools.dnsSuccess = true;
  const [score, rubric] = await d1.grade(mockStudent, '1');
  expect(score).toBe(100);
  expect(rubric.customDomainName).toBe(30);
  expect(rubric.githubPages).toBe(70);
  expect(rubric.comments).toBe('');
});

test('A successful deployment with github pages but no custom domain gets 30 points', async () => {
  mockTools.pageExists = false;
  mockTools.dnsSuccess = true;
  const [score, rubric] = await d1.grade(mockStudent, '1');
  expect(score).toBe(30);
  expect(rubric.customDomainName).toBe(0);
  expect(rubric.githubPages).toBe(30);
  expect(rubric.comments).toBe('JWT Pizza is not functional at the provided website.\n');
});

test('A successful deployment of JWT pizza but not using github pages gets 30 points', async () => {
  mockTools.pageExists = true;
  mockTools.dnsSuccess = false;
  const [score, rubric] = await d1.grade(mockStudent, '1');
  expect(score).toBe(30);
  expect(rubric.customDomainName).toBe(30);
  expect(rubric.githubPages).toBe(0);
  expect(rubric.comments).toBe('Your website is not hosted by GitHub Pages.\n');
});
