import mysql from 'mysql2/promise';
import { User } from '../../domain/User';
import { Submission } from '../../domain/Submission';
import { tableCreateStatements } from './dbModel';
import { config } from '../../../config';
import logger from '../../../logger';
import bcrypt from 'bcrypt';

export class DB {
  private initialized: Promise<void>;
  constructor() {
    this.initialized = this.initializeDatabase();
  }

  async getConnection(): Promise<mysql.Connection> {
    // Make sure the database is initialized before trying to get a connection.
    await this.initialized;
    return this._getConnection();
  }

  async executeQuery(operation: string, query: string, params: any[]) {
    let result;
    const connection = await this.getConnection();
    try {
      result = await connection.query(query, params);
      return result as any;
    } catch (err: any) {
      logger.log('warn', { type: operation, service: 'database' }, { exception: err.message });
    } finally {
      connection.end();
    }
  }

  async _getConnection(setUse = true) {
    const connection = await mysql.createConnection({
      host: config.db.connection.host,
      user: config.db.connection.user,
      password: config.db.connection.password,
      connectTimeout: config.db.connection.connectTimeout,
      decimalNumbers: true,
    });
    if (setUse) {
      await connection.query(`USE ${config.db.connection.database}`);
    }
    return connection;
  }

  async initializeDatabase(): Promise<void> {
    try {
      const connection = await this._getConnection(false);
      try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.db.connection.database}`);
        await connection.query(`USE ${config.db.connection.database}`);

        for (const statement of tableCreateStatements) {
          await connection.query(statement);
        }
      } finally {
        connection.end();
      }
    } catch (err: any) {
      logger.log('warn', { type: 'database_init', service: 'database' }, { message: 'Error initializing database', exception: err.message });
    }
  }

  async checkAdmin(netId: string, password: string) {
    const [rows] = await this.executeQuery('check_admin', `SELECT * FROM admin WHERE netid = ?`, [netId]);
    if (!rows.length) {
      return false;
    }
    const admin = rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password);
    return passwordMatch;
  }

  async putUser(user: User) {
    await this.executeQuery(
      'put_user',
      'INSERT INTO user (name, netid, apiKey, website, github, email, lateDays, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user.name, user.netId, user.apiKey, user.website, user.github, user.email, user.lateDays, user.isAdmin]
    );
  }

  async deleteUser(netId: string) {
    await this.executeQuery('delete_user', 'DELETE FROM user WHERE netid = ?', [netId]);
  }

  async updateUserInfo(netId: string, website: string, github: string, email: string) {
    await this.executeQuery('update_user', 'UPDATE user SET website = ?, github = ?, email = ? WHERE netid = ?', [website, github, email, netId]);
  }

  async getUserId(netId: string) {
    const [rows] = await this.executeQuery('get_user_id', `SELECT id FROM user WHERE netid = ?`, [netId]);
    return rows[0].id || 0;
  }

  async getUser(netId: string) {
    const [rows] = await this.executeQuery('get_user', `SELECT * FROM user WHERE netid = ?`, [netId]);
    if (!rows.length) {
      return null;
    }
    const row = rows[0];
    return new User(row.name, row.netid, row.apiKey, row.website, row.github, row.email, row.lateDays, row.isAdmin);
  }

  async getUserFuzzySearch(search: string) {
    const searchLowerCase = search.toLowerCase();
    const [rows] = await this.executeQuery(
      'get_user_fuzzy_search',
      `SELECT * FROM user WHERE LOWER(netid) LIKE LOWER(?) OR LOWER(name) LIKE LOWER(?) OR LOWER(github) LIKE LOWER(?)`,
      [`%${searchLowerCase}%`, `%${searchLowerCase}%`, `%${searchLowerCase}%`]
    );
    if (!rows.length) {
      return null;
    }
    const row = rows[0];
    return new User(row.name, row.netid, row.apiKey, row.website, row.github, row.email, row.isAdmin);
  }

  async getUserByApiKey(apiKey: string) {
    const [rows] = await this.executeQuery('get_user_by_api_key', `SELECT * FROM user WHERE apiKey = ?`, [apiKey]);
    if (!rows.length) {
      return null;
    }
    const row = rows[0];
    return new User(row.name, row.netid, row.apiKey, row.website, row.github, row.email, row.isAdmin);
  }

  async updateApiKey(netId: string, apiKey: string) {
    await this.executeQuery('update_api_key', 'UPDATE user SET apiKey = ? WHERE netid = ?', [apiKey, netId]);
  }

  async putSubmission(submission: Submission, netId: string) {
    await this.executeQuery('put_submission', 'INSERT INTO submission (time, userId, phase, score, rubric) VALUES (?, ?, ?, ?, ?)', [
      submission.date,
      await this.getUserId(netId),
      submission.phase,
      submission.score,
      submission.rubric,
    ]);
  }

  async getSubmissions(netId: string) {
    const [rows] = await this.executeQuery('get_submissions', `SELECT * FROM submission WHERE userId = ? ORDER BY time DESC`, [
      await this.getUserId(netId),
    ]);
    if (!rows.length) {
      return [];
    }
    return rows.map((row: any) => {
      return new Submission(row.time, row.phase, row.score, row.rubric, row.lateDaysUsed);
    });
  }

  async getMostRecentSubmissionForDeliverable(netId: string, phase: number) {
    const [rows] = await this.executeQuery(
      'get_most_recent_submission_for_deliverable',
      `SELECT * FROM submission WHERE userId = ? AND phase = ? ORDER BY time DESC LIMIT 1`,
      [await this.getUserId(netId), phase]
    );
    if (!rows.length) {
      return null;
    }
    const row = rows[0];
    return new Submission(row.time, row.phase, row.score, row.rubric, row.lateDaysUsed);
  }

  async getSubmissionCountAllPhases() {
    const [rows] = await this.executeQuery(
      'get_submission_count_all_phases',
      `
      SELECT 
        phase, 
        COUNT(*) as submissionCount, 
        COUNT(DISTINCT userId) as studentCount 
      FROM submission 
      GROUP BY phase
    `,
      []
    );
    if (!rows.length) {
      return [];
    }
    return rows.map((row: any) => {
      return { phase: row.phase, submissionCount: row.submissionCount, studentCount: row.studentCount };
    });
  }

  async getNetIdsForDeliverablePhase(phase: number) {
    const [rows] = await this.executeQuery(
      'get_netids_for_deliverable_phase',
      `
      SELECT DISTINCT u.netid
      FROM submission s
      JOIN user u ON s.userId = u.id
      WHERE s.phase = ?;

      `,
      [phase]
    );
    if (!rows.length) {
      return [];
    }
    return rows.map((row: any) => {
      return row.netid;
    });
  }

  async getNetIdByToken(token: string) {
    const [rows] = await this.executeQuery('get_netid_by_token', `SELECT netid FROM token WHERE authtoken = ?`, [token]);
    if (!rows.length) {
      return '';
    }
    return ((rows as any)[0] as any).netid || '';
  }

  async getToken(netId: string) {
    const [rows] = await this.executeQuery('get_token', `SELECT authtoken FROM token WHERE netid = ?`, [netId]);
    if (!rows.length) {
      return '';
    }
    return ((rows as any)[0] as any).authtoken || '';
  }

  async putToken(token: string, netId: string) {
    await this.executeQuery('put_token', 'INSERT INTO token (authtoken, netid) VALUES (?, ?)', [token, netId]);
  }

  async deleteToken(token: string) {
    await this.executeQuery('delete_token', 'DELETE FROM token WHERE authtoken = ?', [token]);
  }

  async getLateDays(netId: string) {
    const [rows] = await this.executeQuery('get_late_days', `SELECT lateDays FROM user WHERE netid = ?`, [netId]);
    if (!rows.length) {
      return 0;
    }
    return ((rows as any)[0] as any).lateDays || 0;
  }

  async updateLateDays(netId: string, days: number) {
    await this.executeQuery('add_late_days', 'UPDATE user SET lateDays = ? WHERE netid = ?', [days, netId]);
  }

  async putPentest(netId: string) {
    await this.executeQuery('put_pentest', 'INSERT INTO pentest (netid) VALUES (?)', [netId]);
  }

  async checkPentestEligibility(netId: string) {
    const [rows] = await this.executeQuery('check_pentest_eligibility', `SELECT * FROM pentest WHERE netid = ?`, [netId]);
    return !!rows.length;
  }

  async getCurrentPentestPartner(netId: string) {
    const [rows] = await this.executeQuery('get_pentest', `SELECT * FROM pentest WHERE netid = ?`, [netId]);
    if (!rows.length) {
      return null;
    }
    const row = rows[0];
    return row.partnerid || '';
  }

  async getEligiblePentestPartners(netId: string) {
    const [rows] = await this.executeQuery('get_pentest_partners', `SELECT * FROM pentest WHERE partnerid = ? AND netid != ?`, ['', netId]);
    if (!rows.length) {
      return [];
    }
    return rows.map((row: any) => {
      return { netId: row.netid, partnerId: row.partnerid };
    });
  }

  async updatePentestPartner(netId: string, partnerId: string) {
    await this.executeQuery('update_pentest_partner', 'UPDATE pentest SET partnerid = ? WHERE netid = ?', [partnerId, netId]);
  }

  async putChaos(netId: string, chaosTime: string) {
    await this.executeQuery('put_chaos', 'INSERT INTO chaos (netid, chaosTime) VALUES (?, ?)', [netId, chaosTime]);
  }

  async getUntriggeredChaos() {
    const [rows] = await this.executeQuery('get_untriggered_chaos', `SELECT * FROM chaos WHERE triggered = false`, []);
    if (!rows.length) {
      return [];
    }
    return rows.map((row: any) => {
      return { netId: row.netid, chaosTime: row.chaosTime };
    });
  }

  async updateChaosTriggeredStatus(netId: string) {
    await this.executeQuery('trigger_chaos', 'UPDATE chaos SET triggered = true WHERE netid = ?', [netId]);
  }

  async getChaosTime(netId: string) {
    const [rows] = await this.executeQuery('get_chaos_time', `SELECT chaosTime FROM chaos WHERE netid = ?`, [netId]);
    if (!rows.length) {
      return '';
    }
    return ((rows as any)[0] as any).chaosTime || '';
  }

  async deleteChaos(netId: string) {
    await this.executeQuery('delete_chaos', 'DELETE FROM chaos WHERE netid = ?', [netId]);
  }
}
