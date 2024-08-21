import { DeliverableTwelve } from '../../grading/graders/DeliverableTwelve';
import { PenTestService } from '../../model/service/PenTestService';
import { MockDB } from '../mock/dao/mockDatabase';
import { mockStudent } from '../mock/mockValues';

const mockDb = new MockDB();
const penTestService = new PenTestService(mockDb);
const d12 = new DeliverableTwelve(penTestService);

test('If eligible partners exist, should return partner info', async () => {
  mockDb.alreadyHasPartner = true;
  const [result] = await d12.grade(mockStudent);
  expect(result).toBe(`Partner: ${mockStudent.name}\nEmail: ${mockStudent.email}\nPizza Url: ${mockStudent.website}`);

  mockDb.alreadyHasPartner = false;
  mockDb.eligiblePartnersExist = true;
  const [result2] = await d12.grade(mockStudent);
  expect(result2).toBe(`Partner: ${mockStudent.name}\nEmail: ${mockStudent.email}\nPizza Url: ${mockStudent.website}`);
});

test('If no eligible partners exist, should return a message informing the user', async () => {
  mockDb.alreadyHasPartner = false;
  mockDb.eligiblePartnersExist = false;
  const [result] = await d12.grade(mockStudent);
  expect(result).toBe('No partners available. Try again later or contact the instructor.');
});
