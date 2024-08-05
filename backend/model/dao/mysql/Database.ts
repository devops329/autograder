import mysql from 'mysql2/promise';
import { User } from '../../domain/User';
import { Submission } from '../../domain/Submission';
import { tableCreateStatements } from './dbModel';
import { config } from '../../../config';
import logger from '../../../logger';

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

  private async executeQuery(operation: string, query: string, params: any[]) {
    let result;
    const connection = await this.getConnection();
    try {
      result = await connection.query(query, params);
      return result as any;
    } catch (err: any) {
      logger.log('warn', { type: operation }, { exception: err.message });
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
      logger.log('warn', { type: 'database_init' }, { message: 'Error initializing database', exception: err.message });
    }
  }

  async putUser(user: User) {
    await this.executeQuery('put_user', 'INSERT INTO user (name, netid, apiKey, website, github, email, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      user.name,
      user.netId,
      user.apiKey,
      user.website,
      user.github,
      user.email,
      user.isAdmin,
    ]);
  }

  async deleteUser(netId: string) {
    await this.executeQuery('delete_user', 'DELETE FROM user WHERE netid = ?', [netId]);
  }

  async updateUserInfo(netId: string, website: string, github: string, email: string) {
    await this.executeQuery('update_user', 'UPDATE user SET website = ?, github = ?, email = ? WHERE netid = ?', [website, github, email, netId]);
  }

  async getUserId(netId: string) {
    const [rows] = await this.executeQuery('get_user_id', `SELECT id FROM user WHERE netid = ?`, [netId]);
    return ((rows as any)[0] as any).id || 0;
  }

  async getUser(netId: string) {
    const [rows] = await this.executeQuery('get_user', `SELECT * FROM user WHERE netid = ?`, [netId]);
    if (!rows) {
      return null;
    }
    const row = (rows as any[])[0];
    return new User(row.name, row.netid, row.apiKey, row.website, row.github, row.email, row.isAdmin);
  }

  async getUserByApiKey(apiKey: string) {
    const [rows] = await this.executeQuery('get_user_by_api_key', `SELECT * FROM user WHERE apiKey = ?`, [apiKey]);
    if (!rows) {
      return null;
    }
    const row = (rows as any[])[0];
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
    const [rows] = await this.executeQuery('get_submissions', `SELECT * FROM submission WHERE userId = ? ORDER BY time DESC`, [await this.getUserId(netId)]);
    if (!rows) {
      return [];
    }
    return (rows as any[]).map((row) => {
      return new Submission(row.time, row.phase, row.score, row.rubric);
    });
  }

  async getNetIdByToken(token: string) {
    const [rows] = await this.executeQuery('get_netid_by_token', `SELECT netid FROM token WHERE authtoken = ?`, [token]);
    if (!rows) {
      return '';
    }
    return ((rows as any)[0] as any).netid || '';
  }

  async getToken(netId: string) {
    const [rows] = await this.executeQuery('get_token', `SELECT authtoken FROM token WHERE netid = ?`, [netId]);
    if (!rows) {
      return '';
    }
    return ((rows as any)[0] as any).authToken || '';
  }

  async putToken(token: string, netId: string) {
    await this.executeQuery('put_token', 'INSERT INTO token (authtoken, netid) VALUES (?, ?)', [token, netId]);
  }

  async deleteToken(token: string) {
    await this.executeQuery('delete_token', 'DELETE FROM token WHERE authtoken = ?', [token]);
  }

  async putPentest(netId: string) {
    await this.executeQuery('put_pentest', 'INSERT INTO pentest (netid) VALUES (?)', [netId]);
  }

  async getPentest(netId: string) {
    const [rows] = await this.executeQuery('get_pentest', `SELECT * FROM pentest WHERE netid = ?`, [netId]);
    if (!rows) {
      return null;
    }
    const row = (rows as any[])[0];
    return { netId: row.netid, partnerId: row.partnerid };
  }

  async getPentestPartners(netId: string) {
    const [rows] = await this.executeQuery('get_pentest_partners', `SELECT * FROM pentest WHERE partnerid = ? AND netid != ?`, ['', netId]);
    if (!rows) {
      return [];
    }
    return (rows as any[]).map((row) => {
      return { netId: row.netid, partnerId: row.partnerid };
    });
  }

  async updatePentestPartner(netId: string, partnerId: string) {
    await this.executeQuery('update_pentest_partner', 'UPDATE pentest SET partnerid = ? WHERE netid = ?', [partnerId, netId]);
  }

  async putChaos(netId: string, chaosTime: Date) {
    await this.executeQuery('put_chaos', 'INSERT INTO chaos (netid, chaosTime) VALUES (?, ?)', [netId, chaosTime.toISOString()]);
  }

  async getUntriggeredChaos() {
    const [rows] = await this.executeQuery('get_untriggered_chaos', `SELECT * FROM chaos WHERE triggered = false`, []);
    if (!rows) {
      return [];
    }
    return (rows as any[]).map((row) => {
      return { netId: row.netid, chaosTime: row.chaosTime };
    });
  }

  async updateChaosTriggeredStatus(netId: string) {
    await this.executeQuery('trigger_chaos', 'UPDATE chaos SET triggered = true WHERE netid = ?', [netId]);
  }

  async getChaosTime(netId: string) {
    const [rows] = await this.executeQuery('get_chaos_time', `SELECT chaosTime FROM chaos WHERE netid = ?`, [netId]);
    if (!rows) {
      return '';
    }
    return ((rows as any)[0] as any).chaosTime || '';
  }

  async deleteChaos(netId: string) {
    await this.executeQuery('delete_chaos', 'DELETE FROM chaos WHERE netid = ?', [netId]);
  }
}
