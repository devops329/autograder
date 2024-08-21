import { DeliverableElevenPartTwo } from '../../grading/graders/DeliverableElevenPartTwo';
import { MockDB } from '../mock/dao/mockDatabase';
import { MockPizzaFactory } from '../mock/dao/mockPizzaFactory';
import { mockStudent } from '../mock/mockValues';
import { MockChaosService } from '../mock/service/mockChaosService';

const mockDb = new MockDB();
const mockPizzaFactory = new MockPizzaFactory();
const mockChaosService = new MockChaosService(mockDb, mockPizzaFactory);

const d11Part2 = new DeliverableElevenPartTwo(mockChaosService);
const mockDate = new Date('2024-04-19T18:00:00.000Z');
let OriginalDate: typeof Date;

beforeAll(() => {
  // Mock the Date constructor to always return the mockDate
  OriginalDate = global.Date;
  global.Date = jest.fn((param?: any) => (param ? new OriginalDate(param) : mockDate)) as any;
});
afterAll(() => {
  // Restore the original Date constructor after all tests
  global.Date = OriginalDate;
});

test('Resolved chaos within 6 hours past deadline should get 80 points', async () => {
  mockChaosService.chaosTime = '2024-04-19T12:00:00.000Z';
  const [score, rubric] = await d11Part2.grade(mockStudent);
  expect(score).toBe(80);
  expect(rubric.issueResolvedInTime).toBe(80);
  expect(rubric.comments).toBe('');
});

test('Resolved chaos 1 hour past deadline should get 70 points', async () => {
  mockChaosService.chaosTime = '2024-04-19T11:00:00.000Z';
  const [score, rubric] = await d11Part2.grade(mockStudent);
  expect(score).toBe(70);
  expect(rubric.issueResolvedInTime).toBe(70);
  expect(rubric.comments).toBe('Issue was resolved 1 hours late.');
});

test('Resolved chaos 4 hours past deadline should get 40 points', async () => {
  mockChaosService.chaosTime = '2024-04-19T08:00:00.000Z';
  const [score, rubric] = await d11Part2.grade(mockStudent);
  expect(score).toBe(40);
  expect(rubric.issueResolvedInTime).toBe(40);
  expect(rubric.comments).toBe('Issue was resolved 4 hours late.');
});

test('Resolved chaos 8 hours past deadline should get 0 points', async () => {
  mockChaosService.chaosTime = '2024-04-19T04:00:00.000Z';
  const [score, rubric] = await d11Part2.grade(mockStudent);
  expect(score).toBe(0);
  expect(rubric.issueResolvedInTime).toBe(0);
  expect(rubric.comments).toBe('Issue was resolved 8 hours late.');
});

test('Should not allow negative scores', async () => {
  mockChaosService.chaosTime = '2024-04-19T00:00:00.000Z';
  const [score, rubric] = await d11Part2.grade(mockStudent);
  expect(score).toBe(0);
  expect(rubric.issueResolvedInTime).toBe(0);
  expect(rubric.comments).toBe('Issue was resolved 12 hours late.');
});
