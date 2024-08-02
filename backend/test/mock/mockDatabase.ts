import { config } from '../../config';
import logger from '../../logger';
import { DB } from '../../model/dao/mysql/Database';
import mysql from 'mysql2/promise';
import { mockStudent, mockSubmissions } from './mockValues';
import { Submission } from '../../model/domain/Submission';

// This class overwrites the query method on the connection.
// It also overwrites any methods that return an object
export class MockDB extends DB {
  private _queries: string[] = [];
  private _submissions: Submission[] = [];
  constructor() {
    super();
  }

  get queries() {
    return this._queries;
  }

  get submissions() {
    return this._submissions;
  }

  clearQueries() {
    this._queries = [];
  }

  clearSubmissions() {
    this._submissions = [];
  }

  async getConnection() {
    // Make sure the database is initialized before trying to get a connection.
    return this._getConnection();
  }

  async _getConnection(setUse = true) {
    const connection = {
      query: async (sql: string, values?: any) => {
        this._queries.push(sql);
        return [[], []];
      },
      end: () => {},
    } as any as mysql.Connection;
    if (setUse) {
      await connection.query(`USE ${config.db.connection.database}`);
    }
    return connection;
  }

  async getUserId(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT id FROM user WHERE netid = ?`, [netId]);
      return 12345;
    } catch (err: any) {
      logger.log('warn', { type: 'get_user_id' }, { netid: netId, exception: err.message });
      return 0;
    } finally {
      connection.end();
    }
  }

  async getUser(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM user WHERE netid = ?`, [netId]);
      return mockStudent;
    } catch (err: any) {
      logger.log('warn', { type: 'get_user' }, { netid: netId, exception: err.message });
      return null;
    } finally {
      connection.end();
    }
  }

  async getUserByApiKey(apiKey: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM user WHERE apiKey = ?`, [apiKey]);
      return mockStudent;
    } catch (err: any) {
      logger.log('warn', { type: 'get_user_by_api_key' }, { apiKey: apiKey, exception: err.message });
      return null;
    } finally {
      connection.end();
    }
  }

  async getSubmissions(netId: string) {
    const connection = await this.getConnection();
    try {
      const userId = await this.getUserId(netId);
      // Get all submissions for the user, ordered by time
      const [rows] = await connection.query(`SELECT * FROM submission WHERE userId = ? ORDER BY time DESC`, [userId]);
      return this.submissions;
    } catch (err: any) {
      logger.log('warn', { type: 'get_submissions' }, { netid: netId, exception: err.message });
      return [];
    } finally {
      connection.end();
    }
  }

  async getNetIdByToken(token: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT netid FROM token WHERE authtoken = ?`, [token]);
      return 'mockNetId';
    } catch (err: any) {
      logger.log('warn', { type: 'get_netid_by_token' }, { exception: err.message });
      return '';
    } finally {
      connection.end();
    }
  }

  async getToken(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT authtoken FROM token WHERE netid = ?`, [netId]);
      return 'mockToken';
    } catch (err: any) {
      logger.log('warn', { type: 'get_token' }, { netid: netId, exception: err.message });
      return '';
    } finally {
      connection.end();
    }
  }

  async getPentest(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM pentest WHERE netid = ?`, [netId]);
      return { netId: 'student', partnerId: 'anotherStudent' };
    } catch (err: any) {
      logger.log('warn', { type: 'get_pentest' }, { netid: netId, exception: err.message });
      return null;
    } finally {
      connection.end();
    }
  }

  async getPentestPartners(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM pentest WHERE partnerid = ? AND netid != ?`, ['', netId]);
      return [];
    } catch (err: any) {
      logger.log('warn', { type: 'get_pentest_partners' }, { netid: netId, exception: err.message });
      return [];
    } finally {
      connection.end();
    }
  }

  async getUntriggeredChaos() {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM chaos WHERE triggered = false`);
      return [];
    } catch (err: any) {
      logger.log('warn', { type: 'get_untriggered_chaos' }, { exception: err.message });
      return [];
    } finally {
      connection.end();
    }
  }

  async getChaosTime(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT chaosTime FROM chaos WHERE netid = ?`, [netId]);
      return '';
    } catch (err: any) {
      logger.log('warn', { type: 'get_chaos_time' }, { netid: netId, exception: err.message });
      return '';
    } finally {
      connection.end();
    }
  }
}
