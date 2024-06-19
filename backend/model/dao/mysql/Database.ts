import mysql from 'mysql2/promise';
import { User } from '../../domain/User';
import { Submission } from '../../domain/Submission';
import { tableCreateStatements } from './dbModel';
import { config } from '../../../config';

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

  async checkDatabaseExists(connection: mysql.Connection) {
    const rows = await connection.execute(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [config.db.connection.database]);
    return rows.length > 0;
  }

  async initializeDatabase(): Promise<void> {
    try {
      const connection = await this._getConnection(false);
      try {
        const dbExists = await this.checkDatabaseExists(connection);
        console.log(dbExists ? 'Database exists' : 'Database does not exist');

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.db.connection.database}`);
        await connection.query(`USE ${config.db.connection.database}`);

        for (const statement of tableCreateStatements) {
          await connection.query(statement);
        }
      } finally {
        connection.end();
      }
    } catch (err: any) {
      console.error(JSON.stringify({ message: 'Error initializing database', exception: err.message, connection: config.db.connection }));
    }
  }

  async putUser(user: User) {
    const connection = await this.getConnection();
    try {
      console.log('Inserting user:', user);
      await connection.query(
        `INSERT INTO user (name, netid, apiKey, website, github, email, isAdmin) VALUES ('${user.name}', '${user.netId}', '${user.apiKey}', '${user.website}', '${user.github}', '${user.email}', ${user.isAdmin})`
      );
    } catch (err: any) {
      console.error('Error putting user:', err.message);
    } finally {
      connection.end();
    }
  }

  async updateUserInfo(netId: string, website: string, github: string, email: string) {
    const connection = await this.getConnection();
    try {
      console.log('Updating user:', netId);
      await connection.query(`UPDATE user SET website = '${website}', github = '${github}', email = '${email}' WHERE netid = '${netId}'`);
    } catch (err: any) {
      console.error('Error updating user:', err.message);
    } finally {
      connection.end();
    }
  }

  async getUserId(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT id FROM user WHERE netid = '${netId}'`);
      return ((rows as any)[0] as any).id || 0;
    } catch (err: any) {
      console.error('Error getting user ID:', err.message);
      return 0;
    } finally {
      connection.end();
    }
  }

  async getUser(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM user WHERE netid = '${netId}'`);
      const row = (rows as any[])[0];
      return new User(row.id, row.name, row.netid, row.apiKey, row.website, row.github, row.email, row.isAdmin);
    } catch (err: any) {
      console.error('Error getting user:', err.message);
      return null;
    } finally {
      connection.end();
    }
  }

  async putSubmission(submission: Submission, netId: string) {
    const connection = await this.getConnection();
    try {
      const userId = await this.getUserId(netId);
      console.log('Inserting submission:', submission);
      await connection.query(`INSERT INTO submission (time, userId, phase, score) VALUES ('${submission.date}', ${userId}, '${submission.phase}', ${submission.score})`);
    } catch (err: any) {
      console.error('Error putting submission:', err.message);
    } finally {
      connection.end();
    }
  }

  async getSubmissions(netId: string) {
    const connection = await this.getConnection();
    try {
      const userId = await this.getUserId(netId);
      console.log('Getting submissions for user:', userId);
      const [rows] = await connection.query(`SELECT * FROM submission WHERE userId = ${userId}`);
      return (rows as any[]).map((row) => {
        return new Submission(row.time, row.phase, row.score);
      });
    } catch (err: any) {
      console.error('Error getting submissions:', err.message);
      return [];
    } finally {
      connection.end();
    }
  }

  async getNetIdByToken(token: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT netid FROM token WHERE authtoken = '${token}'`);
      return ((rows as any)[0] as any).netid || '';
    } catch (err: any) {
      console.error('Error getting netid by token:', err.message);
      return '';
    } finally {
      connection.end();
    }
  }

  async getToken(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT authtoken FROM token WHERE netid = '${netId}'`);
      return ((rows as any)[0] as any).authToken || '';
    } catch (err: any) {
      console.error('Error getting token:', err.message);
      return '';
    } finally {
      connection.end();
    }
  }

  async putToken(token: string, netId: string) {
    const connection = await this.getConnection();
    try {
      console.log('Inserting token:', token);
      await connection.query(`INSERT INTO token (authtoken, netid) VALUES ('${token}', '${netId}')`);
    } catch (err: any) {
      console.error('Error putting token:', err.message);
    } finally {
      connection.end();
    }
  }

  async deleteToken(token: string) {
    const connection = await this.getConnection();
    try {
      console.log('Deleting token:', token);
      await connection.query(`DELETE FROM token WHERE authtoken = '${token}'`);
    } catch (err: any) {
      console.error('Error deleting token:', err.message);
    } finally {
      connection.end();
    }
  }

  async putPentest(netId: string) {
    const connection = await this.getConnection();
    try {
      console.log('Inserting pentest:', netId);
      await connection.query(`INSERT INTO pentest (netid) VALUES ('${netId}')`);
    } catch (err: any) {
      console.error('Error putting pentest:', err.message);
    } finally {
      connection.end();
    }
  }

  async getPentest(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM pentest WHERE netid = '${netId}'`);
      const row = (rows as any[])[0];
      return { netId: row.netid, partnerId: row.partnerid };
    } catch (err: any) {
      console.error('Error getting pentest:', err.message);
      return null;
    } finally {
      connection.end();
    }
  }

  async getPentestPartners(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM pentest WHERE partnerid = '' AND netid != '${netId}'`);
      return (rows as any[]).map((row) => {
        return { netId: row.netid, partnerId: row.partnerid };
      });
    } catch (err: any) {
      console.error('Error getting pentest without partner:', err.message);
      return [];
    } finally {
      connection.end();
    }
  }

  async updatePentestPartner(netId: string, partnerId: string) {
    const connection = await this.getConnection();
    try {
      console.log('Updating pentest partner:', netId);
      await connection.query(`UPDATE pentest SET partnerid = '${partnerId}' WHERE netid = '${netId}'`);
    } catch (err: any) {
      console.error('Error updating pentest partner:', err.message);
    } finally {
      connection.end();
    }
  }
}
