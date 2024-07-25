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

  async getConnection() {
    // Make sure the database is initialized before trying to get a connection.
    await this.initialized;
    return this._getConnection();
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
      logger.log('error', [{ type: 'database_init' }], { message: 'Error initializing database', exception: err.message });
    }
  }

  async putUser(user: User) {
    const connection = await this.getConnection();
    try {
      await connection.query(`INSERT INTO user (name, netid, apiKey, website, github, email, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        user.name,
        user.netId,
        user.apiKey,
        user.website,
        user.github,
        user.email,
        user.isAdmin,
      ]);
    } catch (err: any) {
      logger.log('error', [{ type: 'put_user' }], { netid: user.netId, exception: err.message });
    } finally {
      connection.end();
    }
  }

  async updateUserInfo(netId: string, website: string, github: string, email: string) {
    const connection = await this.getConnection();
    try {
      await connection.query(`UPDATE user SET website = ?, github = ?, email = ? WHERE netid = ?`, [website, github, email, netId]);
    } catch (err: any) {
      logger.log('error', [{ type: 'update_user' }], { netid: netId, exception: err.message });
    } finally {
      connection.end();
    }
  }

  async getUserId(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT id FROM user WHERE netid = ?`, [netId]);
      return ((rows as any)[0] as any).id || 0;
    } catch (err: any) {
      logger.log('error', [{ type: 'get_user_id' }], { netid: netId, exception: err.message });
      return 0;
    } finally {
      connection.end();
    }
  }

  async getUser(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM user WHERE netid = ?`, [netId]);
      const row = (rows as any[])[0];
      return new User(row.name, row.netid, row.apiKey, row.website, row.github, row.email, row.isAdmin);
    } catch (err: any) {
      logger.log('error', [{ type: 'get_user' }], { netid: netId, exception: err.message });
      return null;
    } finally {
      connection.end();
    }
  }

  async getUserByApiKey(apiKey: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM user WHERE apiKey = ?`, [apiKey]);
      const row = (rows as any[])[0];
      return new User(row.name, row.netid, row.apiKey, row.website, row.github, row.email, row.isAdmin);
    } catch (err: any) {
      logger.log('error', [{ type: 'get_user_by_api_key' }], { apiKey: apiKey, exception: err.message });
      return null;
    } finally {
      connection.end();
    }
  }

  async updateApiKey(netId: string, apiKey: string) {
    const connection = await this.getConnection();
    try {
      await connection.query(`UPDATE user SET apiKey = ? WHERE netid = ?`, [apiKey, netId]);
    } catch (err: any) {
      logger.log('error', [{ type: 'update_api_key' }], { netid: netId, exception: err.message });
    } finally {
      connection.end();
    }
  }

  async putSubmission(submission: Submission, netId: string) {
    const connection = await this.getConnection();
    try {
      const userId = await this.getUserId(netId);
      await connection.query(`INSERT INTO submission (time, userId, phase, score, rubric) VALUES (?, ?, ?, ?, ?)`, [submission.date, userId, submission.phase, submission.score, submission.rubric]);
    } catch (err: any) {
      logger.log('error', [{ type: 'put_submission' }], { netid: netId, exception: err.message });
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
      return (rows as any[]).map((row) => {
        return new Submission(row.time, row.phase, row.score, row.rubric);
      });
    } catch (err: any) {
      logger.log('error', [{ type: 'get_submissions' }], { netid: netId, exception: err.message });
      return [];
    } finally {
      connection.end();
    }
  }

  async getMostRecentSubmissionOtherDeliverables(netId: string, deliverable: number) {
    const connection = await this.getConnection();
    try {
      const userId = await this.getUserId(netId);
      const [rows] = await connection.query(`SELECT * FROM submission WHERE userId = ? AND phase != ? ORDER BY time DESC LIMIT 1`, [userId, `Phase ${deliverable}`]);
      const row = (rows as any[])[0];
      return new Submission(row.time, row.phase, row.score, row.rubric);
    } catch (err: any) {
      logger.log('error', [{ type: 'get_most_recent_submission_other_deliverables' }], { netid: netId, exception: err.message });
      return null;
    } finally {
      connection.end();
    }
  }

  async getNetIdByToken(token: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT netid FROM token WHERE authtoken = ?`, [token]);
      return ((rows as any)[0] as any).netid || '';
    } catch (err: any) {
      logger.log('error', [{ type: 'get_netid_by_token' }], { exception: err.message });
      return '';
    } finally {
      connection.end();
    }
  }

  async getToken(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT authtoken FROM token WHERE netid = ?`, [netId]);
      return ((rows as any)[0] as any).authToken || '';
    } catch (err: any) {
      logger.log('error', [{ type: 'get_token' }], { netid: netId, exception: err.message });
      return '';
    } finally {
      connection.end();
    }
  }

  async putToken(token: string, netId: string) {
    const connection = await this.getConnection();
    try {
      await connection.query(`INSERT INTO token (authtoken, netid) VALUES (?, ?)`, [token, netId]);
    } catch (err: any) {
      logger.log('error', [{ type: 'put_token' }], { netid: netId, exception: err.message });
    } finally {
      connection.end();
    }
  }

  async deleteToken(token: string) {
    const connection = await this.getConnection();
    try {
      await connection.query(`DELETE FROM token WHERE authtoken = ?`, [token]);
    } catch (err: any) {
      logger.log('error', [{ type: 'delete_token' }], { exception: err.message });
    } finally {
      connection.end();
    }
  }

  async putPentest(netId: string) {
    const connection = await this.getConnection();
    try {
      await connection.query(`INSERT INTO pentest (netid) VALUES (?)`, [netId]);
    } catch (err: any) {
      logger.log('error', [{ type: 'put_pentest' }], { netid: netId, exception: err.message });
    } finally {
      connection.end();
    }
  }

  async getPentest(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM pentest WHERE netid = ?`, [netId]);
      const row = (rows as any[])[0];
      return { netId: row.netid, partnerId: row.partnerid };
    } catch (err: any) {
      logger.log('error', [{ type: 'get_pentest' }], { netid: netId, exception: err.message });
      return null;
    } finally {
      connection.end();
    }
  }

  async getPentestPartners(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM pentest WHERE partnerid = ? AND netid != ?`, ['', netId]);
      return (rows as any[]).map((row) => {
        return { netId: row.netid, partnerId: row.partnerid };
      });
    } catch (err: any) {
      logger.log('error', [{ type: 'get_pentest_partners' }], { netid: netId, exception: err.message });
      return [];
    } finally {
      connection.end();
    }
  }

  async updatePentestPartner(netId: string, partnerId: string) {
    const connection = await this.getConnection();
    try {
      await connection.query(`UPDATE pentest SET partnerid = ? WHERE netid = ?`, [partnerId, netId]);
    } catch (err: any) {
      logger.log('error', [{ type: 'update_pentest_partner' }], { netid: netId, exception: err.message });
    } finally {
      connection.end();
    }
  }

  async putChaos(netId: string, chaosTime: Date) {
    const connection = await this.getConnection();
    try {
      await connection.query(`INSERT INTO chaos (netid, chaosTime) VALUES (?, ?)`, [netId, chaosTime.toISOString()]);
    } catch (err: any) {
      logger.log('error', [{ type: 'put_chaos' }], { netid: netId, exception: err.message });
    } finally {
      connection.end();
    }
  }

  async getUntriggeredChaos() {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM chaos WHERE triggered = false`);
      return (rows as any[]).map((row) => {
        return { netId: row.netid, chaosTime: row.chaosTime };
      });
    } catch (err: any) {
      logger.log('error', [{ type: 'get_untriggered_chaos' }], { exception: err.message });
      return [];
    } finally {
      connection.end();
    }
  }

  async updateChaosTriggeredStatus(netId: string) {
    const connection = await this.getConnection();
    try {
      await connection.query(`UPDATE chaos SET triggered = true WHERE netid = ?`, [netId]);
    } catch (err: any) {
      logger.log('error', [{ type: 'trigger_chaos' }], { netid: netId, exception: err.message });
    } finally {
      connection.end();
    }
  }

  async getChaosTime(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT chaosTime FROM chaos WHERE netid = ?`, [netId]);
      return ((rows as any)[0] as any).chaosTime || '';
    } catch (err: any) {
      logger.log('error', [{ type: 'get_chaos_time' }], { netid: netId, exception: err.message });
      return '';
    } finally {
      connection.end();
    }
  }

  async deleteChaos(netId: string) {
    const connection = await this.getConnection();
    try {
      await connection.query(`DELETE FROM chaos WHERE netid = ?`, [netId]);
    } catch (err: any) {
      logger.log('error', [{ type: 'delete_chaos' }], { netid: netId, exception: err.message });
    } finally {
      connection.end();
    }
  }
}
