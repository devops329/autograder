import app from '../service';
import { DB } from '../model/dao/mysql/Database';
import request from 'supertest';
import { User } from '../model/domain/User';

function createUser(isAdmin: boolean) {
  if (isAdmin) {
    return new User('admin', 'admin', 'admin', 'admin', 'admin', 'admin', isAdmin);
  }
  return new User('test', 'test', 'test', 'test', 'test', 'test', isAdmin);
}

const db = new DB();
let testToken: string;
let adminToken: string;
beforeAll(async () => {
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
  const adminUser = await db.getUser('test');
  if (!adminUser) {
    await db.putUser(createUser(true));
  }
  adminToken = await db.getNetIdByToken('admin');
  if (!adminToken) {
    await db.putToken('admin', 'admin');
    adminToken = 'admin';
  }
});

test('secure routes reject if no authtoken', async () => {
  const response = await request(app).get('/api/grade');
  expect(response.status).toBe(401);
});
