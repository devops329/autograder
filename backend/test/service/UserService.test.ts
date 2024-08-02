import { UserService } from '../../model/service/UserService';
import { MockCanvas } from '../mock/dao/mockCanvas';
import { MockDB } from '../mock/dao/mockDatabase';
import { MockPizzaFactory } from '../mock/grading/mockPizzaFactory';
import { mockToken } from '../mock/mockValues';

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

beforeEach(() => {
  mockDB.clearQueries();
});

test('UserService builds', () => {
  expect(userService).toBeDefined();
});

test('logout deletes authtoken from db', async () => {
  await userService.logout('test');
  expect(mockDB.queries).toContain('DELETE FROM token WHERE authtoken = ?');
});

test('login returns token if user exists', async () => {
  const token = await userService.login('test');
  expect(token).toBe(mockToken);
});
