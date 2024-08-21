import { DeliverableElevenPartOne } from '../../grading/graders/DeliverableElevenPartOne';
import { MockDB } from '../mock/dao/mockDatabase';
import { MockPizzaFactory } from '../mock/dao/mockPizzaFactory';
import { mockStudent } from '../mock/mockValues';
import { MockChaosService } from '../mock/service/mockChaosService';
const mockDb = new MockDB();
const mockPizzaFactory = new MockPizzaFactory();
const mockChaosService = new MockChaosService(mockDb, mockPizzaFactory);

const d11Part1 = new DeliverableElevenPartOne(mockChaosService);

test('Triggers chaos and notifies user', async () => {
  const response = await d11Part1.grade(mockStudent);
  expect(response).toEqual(['The chaos has been scheduled for you. Good luck!']);
  expect(mockChaosService.chaosScheduled).toBe(true);
});
