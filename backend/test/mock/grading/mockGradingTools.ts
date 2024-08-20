import { GradingTools } from '../../../grading/tools/GradingTools';

export class MockGradingTools implements GradingTools {
  private _pageExists: boolean = true;
  private _dnsSuccess: boolean = true;
  private _coverage: boolean = true;
  set pageExists(value: boolean) {
    this._pageExists = value;
  }
  set dnsSuccess(value: boolean) {
    this._dnsSuccess = value;
  }
  set coverage(value: boolean) {
    this._coverage = value;
  }
  async checkDNS(hostname: string, regex: RegExp, gradeAttemptId: string): Promise<boolean> {
    return this._dnsSuccess;
  }
  async checkPageExistsAndContainsText(hostname: string, regex: RegExp): Promise<boolean> {
    return this._pageExists;
  }
  async readPageJson(hostname: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async getEnvVariable(envFile: string, variableName: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  async createUserAndLogin(serviceUrl: string, gradeAttemptId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  async checkCoverage(badge: string, percentage: number): Promise<boolean> {
    return this._coverage;
  }
  getHostnameFromWebsite(website: string): string {
    throw new Error('Method not implemented.');
  }
}
