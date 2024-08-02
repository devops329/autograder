import { UserService } from '../../model/service/UserService';
import { MockCanvas } from '../mock/dao/mockCanvas';
import { MockDB } from '../mock/dao/mockDatabase';
import { MockPizzaFactory } from '../mock/grading/mockPizzaFactory';

const mockDB = new MockDB();
const mockCanvas = new MockCanvas();
const mockPizzaFactory = new MockPizzaFactory();
const userService = new UserService(mockDB, mockPizzaFactory, mockCanvas);

beforeAll(async () => {
  // Mock fetch
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: 'mocked data' }),
    })
  );
});

test('UserService builds', () => {
  expect(userService).toBeDefined();
});
