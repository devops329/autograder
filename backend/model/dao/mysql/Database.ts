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
      if (!(await this.getUserId(user.netId))) {
        console.log('Inserting user:', user);
        await connection.query(`INSERT INTO User (name, netid, apiKey, isAdmin) VALUES ('${user.name}', '${user.netId}', '${user.apiKey}', ${user.isAdmin})`);
      }
    } catch (err: any) {
      console.error('Error putting user:', err.message);
    }
  }

  async getUserId(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT id FROM User WHERE netid = '${netId}'`);
      return ((rows as any)[0] as any).id || 0;
    } catch (err: any) {
      console.error('Error getting user ID:', err.message);
      return 0;
    }
  }

  async getUser(netId: string) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM User WHERE netid = '${netId}'`);
      const row = (rows as any[])[0];
      return new User(row.id, row.name, row.netid, row.apiKey);
    } catch (err: any) {
      console.error('Error getting user:', err.message);
      return null;
    }
  }

  async putSubmission(submission: Submission, netId: string) {
    const connection = await this.getConnection();
    {
      try {
        const userId = await this.getUserId(netId);
        console.log('Inserting submission:', submission);
        await connection.query(`INSERT INTO Submission (time, userId, phase, score) VALUES ('${submission.date}', ${userId}, '${submission.phase}', ${submission.score})`);
      } catch (err: any) {
        console.error('Error putting submission:', err.message);
      }
    }
  }

  async getSubmissions(netId: string) {
    const connection = await this.getConnection();
    try {
      const userId = await this.getUserId(netId);
      console.log('Getting submissions for user:', userId);
      const [rows] = await connection.query(`SELECT * FROM Submission WHERE userId = ${userId}`);
      return (rows as any[]).map((row) => {
        return new Submission(row.time, row.phase, row.score);
      });
    } catch (err: any) {
      console.error('Error getting submissions:', err.message);
      return [];
    }
  }
}
