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
  private _alreadyHasPartner = true;
  private _eligiblePartnersExist = true;
  private tokenExists = true;

  constructor() {
    super();
  }

  get queries() {
    return this._queries;
  }

  get submissions() {
    return this._submissions;
  }

  set alreadyHasPartner(hasPartner: boolean) {
    this._alreadyHasPartner = hasPartner;
  }

  set eligiblePartnersExist(partnersExist: boolean) {
    this._eligiblePartnersExist = partnersExist;
  }

  setTokenExists(tokenExists: boolean) {
    this.tokenExists = tokenExists;
  }

  clearQueries() {
    this._queries = [];
  }

  clearSubmissions() {
    this._submissions = [];
  }

  async initializeDatabase(): Promise<void> {
    return;
  }

  async executeQuery(operation: string, query: string, params: any[]) {
    this._queries.push(query);
    return true;
  }

  async getUserId(netId: string) {
    await this.executeQuery('get_user_id', 'SELECT id FROM user WHERE netid = ?', [netId]);
    return 12345;
  }

  async getUser(netId: string) {
    await this.executeQuery('get_user_id', `SELECT id FROM user WHERE netid = ?`, [netId]);
    return mockStudent;
  }

  async getUserByApiKey(apiKey: string) {
    await this.executeQuery('get_user_by_api_key', `SELECT * FROM user WHERE apiKey = ?`, [apiKey]);
    return mockStudent;
  }

  async putSubmission(submission: Submission, netId: string) {
    await this.executeQuery('put_submission', 'INSERT INTO submission (time, userId, phase, score, rubric) VALUES (?, ?, ?, ?, ?)', [
      submission.date,
      await this.getUserId(netId),
      submission.phase,
      submission.score,
      submission.rubric,
    ]);
    this._submissions.push(submission);
  }

  async getSubmissions(netId: string) {
    // Get all submissions for the user, ordered by time
    await this.executeQuery('get_submissions', `SELECT * FROM submission WHERE userId = ? ORDER BY time DESC`, [await this.getUserId(netId)]);
    return this.submissions;
  }

  async getNetIdByToken(token: string) {
    await this.executeQuery('get_netid_by_token', `SELECT netid FROM token WHERE authtoken = ?`, [token]);
    return mockNetId;
  }

  async getToken(netId: string) {
    await this.executeQuery('get_token', `SELECT authtoken FROM token WHERE netid = ?`, [netId]);
    return this.tokenExists ? mockToken : null;
  }

  async getCurrentPentestPartner(netId: string) {
    await this.executeQuery('get_pentest', `SELECT * FROM pentest WHERE netid = ?`, [netId]);
    return this._alreadyHasPartner ? { partnerId: 'anotherStudent' } : '';
  }

  async getEligiblePentestPartners(netId: string) {
    await this.executeQuery('get_pentest_partners', `SELECT * FROM pentest WHERE partnerid = ? AND netid != ?`, ['', netId]);
    return this._eligiblePartnersExist ? [mockStudent] : [];
  }

  async checkPentestEligibility(netId: string) {
    await this.executeQuery('check_pentest_eligibility', `SELECT * FROM pentest WHERE netid = ?`, [netId]);
    return true;
  }

  async getUntriggeredChaos() {
    await this.executeQuery('get_untriggered_chaos', `SELECT * FROM chaos WHERE triggered = false`, []);
    return [];
  }

  async getChaosTime(netId: string) {
    await this.executeQuery('get_chaos_time', `SELECT chaosTime FROM chaos WHERE netid = ?`, [netId]);
    return '';
  }
}
