import request from 'supertest';
import { DB } from '../../model/dao/mysql/Database';
import { User } from '../../model/domain/User';
import app from '../../service';
import { mockAdmin, mockStudent } from '../mock/mockValues';

function createUser(isAdmin: boolean) {
  if (isAdmin) {
    return mockAdmin;
  }
  return mockStudent;
}

const db = new DB();
let testToken: string;
let adminToken: string;
beforeAll(async () => {
  // Mock fetch
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: 'mocked data' }),
    })
  );

  // Add a test user to the database
  const testUser = await db.getUser('test');
  if (!testUser) {
    await db.putUser(createUser(false));
  }
  testToken = await db.getNetIdByToken('test');
  if (!testToken) {
    await db.putToken('test', 'test');
    testToken = 'test';
  }
  // Add an admin user to the database
  const adminUser = await db.getUser('admin');
  if (!adminUser) {
    await db.putUser(createUser(true));
  }
  adminToken = await db.getNetIdByToken('admin');
  if (!adminToken) {
    await db.putToken('admin', 'admin');
    adminToken = 'admin';
  }
});

afterAll(async () => {
  // Remove test user from database
  await db.deleteUser('test');
  await db.deleteToken('test');
  // Remove admin user from database
  await db.deleteUser('admin');
  await db.deleteToken('admin');
});

test('secure routes reject if no authtoken', async () => {
  const response = await request(app).get('/api/grade');
  expect(response.status).toBe(401);
});

test("allows admin users to access other users' info", async () => {
  const response = await request(app)
    .post('/api/user')
    .send({ netId: 'test' })
    .set('Cookie', [`token=${adminToken}`]);
  expect(response.status).toBe(200);
});

test('allows normal users to access their own info but not others', async () => {
  const responseWithNetIdInBody = await request(app)
    .post('/api/user')
    .send({ netId: 'test' })
    .set('Cookie', [`token=${testToken}`]);
  expect(responseWithNetIdInBody.status).toBe(200);
  const responseWithoutNetIdInBody = await request(app)
    .post('/api/user')
    .set('Cookie', [`token=${testToken}`]);
  expect(responseWithoutNetIdInBody.status).toBe(200);
  const responseWithDifferentNetId = await request(app)
    .post('/api/user')
    .send({ netId: 'admin' })
    .set('Cookie', [`token=${testToken}`]);
  expect(responseWithDifferentNetId.status).toBe(401);
});
