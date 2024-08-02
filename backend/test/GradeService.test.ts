import { GradeService } from '../model/service/GradeService';
import { MockCanvas } from './mock/mockCanvas';
import { MockDB } from './mock/mockDatabase';
import { MockGradeFactory } from './mock/mockGradeFactory';
import { mockSubmission, mockSubmissions } from './mock/mockValues';

const mockDB = new MockDB();
const mockCanvas = new MockCanvas();
const mockGradeFactory = new MockGradeFactory();
const gradeService = new GradeService(mockDB, mockCanvas, mockGradeFactory);

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

test('Does not submit to db if canvas grade submission fails', async () => {
  mockCanvas.success = false;
  const [message, submissions, rubric] = await gradeService.grade(1, 'test');
  expect(message).toBe('Error');
  expect(submissions).toEqual(mockSubmissions);
  expect(mockDB.queries).not.toContain('INSERT INTO submission (time, userId, phase, score, rubric) VALUES (?, ?, ?, ?, ?)');
});

test('Submits to db if canvas grade submission succeeds', async () => {
  mockCanvas.success = true;
  const [message, submissions, rubric] = await gradeService.grade(1, 'test');
  expect(message).toBe('Score: fake score');
  expect(submissions).toEqual(mockSubmissions);
  expect(mockDB.queries).toContain('INSERT INTO submission (time, userId, phase, score, rubric) VALUES (?, ?, ?, ?, ?)');
});
