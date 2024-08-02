import { config } from '../../../config';
import logger from '../../../logger';
import { DB } from '../../../model/dao/mysql/Database';
import mysql from 'mysql2/promise';
import { mockNetId, mockStudent, mockSubmissions, mockToken } from '../mockValues';
import { Submission } from '../../../model/domain/Submission';

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
      return null;
    } finally {
      connection.end();
    }
  }

  async putSubmission(submission: Submission, netId: string) {
    const connection = await this.getConnection();
    try {
      const userId = await this.getUserId(netId);
      await connection.query(`INSERT INTO submission (time, userId, phase, score, rubric) VALUES (?, ?, ?, ?, ?)`, [submission.date, userId, submission.phase, submission.score, submission.rubric]);
      this._submissions.push(submission);
    } catch (err: any) {
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
      return [];
    } finally {
      connection.end();
    }
  }

  async getNetIdByToken(token: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT netid FROM token WHERE authtoken = ?`, [token]);
      return mockNetId;
    } catch (err: any) {
      return '';
    } finally {
      connection.end();
    }
  }

  async getToken(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT authtoken FROM token WHERE netid = ?`, [netId]);
      return mockToken;
    } catch (err: any) {
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
      return '';
    } finally {
      connection.end();
    }
  }
}
