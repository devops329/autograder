import { DeliverableOne } from '../../grading/graders/DeliverableOne';
import { User } from '../../model/domain/User';
import { MockGradingTools } from '../mock/grading/mockGradingTools';
import { mockStudent, mockStudentNoWebsiteOrGithub } from '../mock/mockValues';

const d1 = new DeliverableOne(new MockGradingTools());

test('A student with no website gets 0 points', async () => {
  const mockStudent = mockStudentNoWebsiteOrGithub;
  const [score, rubric] = await d1.grade(mockStudent, '1');
  expect(score).toBe(0);
  expect(rubric.customDomainName).toBe(0);
  expect(rubric.comments).toBe('No website provided.\n');
});
