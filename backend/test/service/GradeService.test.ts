import { GradeService } from '../../model/service/GradeService';
import { MockCanvas } from '../mock/dao/mockCanvas';
import { MockDB } from '../mock/dao/mockDatabase';
import { MockPizzaFactory } from '../mock/dao/mockPizzaFactory';
import { MockGradeFactory } from '../mock/grading/mockGradeFactory';
import { MockChaosService } from '../mock/service/mockChaosService';

const mockDB = new MockDB();
const mockCanvas = new MockCanvas();
const mockGradeFactory = new MockGradeFactory();
const mockPizzaFactory = new MockPizzaFactory();
const mockChaosService = new MockChaosService(mockDB, mockPizzaFactory);
const gradeService = new GradeService(mockDB, mockCanvas, mockGradeFactory, mockChaosService);

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
  mockDB.clearSubmissions();
});

test('GradeService builds', () => {
  expect(gradeService).toBeDefined();
});

test('Only submits to db if canvas grade submission succeeds', async () => {
  mockCanvas.success = false;
  let [message, submissions, rubric] = await gradeService.grade(1, 'test');
  expect(message).toBe('Error');
  expect(submissions.length).toBe(0);
  expect(mockDB.queries).not.toContain('INSERT INTO submission (time, userId, phase, score, rubric) VALUES (?, ?, ?, ?, ?)');

  mockCanvas.success = true;
  [message, submissions, rubric] = await gradeService.grade(1, 'test');
  expect(message).toBe('Score: fake score');
  expect(submissions.length).toBe(1);
  expect(mockDB.queries).toContain('INSERT INTO submission (time, userId, phase, score, rubric) VALUES (?, ?, ?, ?, ?)');
});
