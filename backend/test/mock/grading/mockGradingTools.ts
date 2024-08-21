import { GradingTools } from '../../../grading/tools/GradingTools';

export class MockGradingTools implements GradingTools {
  private _pageExists: boolean = true;
  private _success404: boolean = true;
  private _dnsSuccess: boolean = true;
  private _coverage: boolean = true;
  private _serviceWorks: boolean = true;
  private _envVariable: string = 'mock';
  set pageExists(value: boolean) {
    this._pageExists = value;
  }
  set success404(value: boolean) {
    this._success404 = value;
  }
  set dnsSuccess(value: boolean) {
    this._dnsSuccess = value;
  }
  set coverage(value: boolean) {
    this._coverage = value;
  }
  set serviceWorks(value: boolean) {
    this._serviceWorks = value;
  }
  set envVariable(value: string) {
    this._envVariable = value;
  }
  async checkDNS(hostname: string, regex: RegExp, gradeAttemptId: string): Promise<boolean> {
    return this._dnsSuccess;
  }
  async checkPageExistsAndContainsText(hostname: string, regex: RegExp): Promise<boolean> {
    if (hostname.includes('garbage')) {
      return this._success404;
    }
    return this._pageExists;
  }
  async readPageJson(hostname: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async getEnvVariable(envFile: string, variableName: string): Promise<string> {
    return this._envVariable;
  }
  async createUserAndLogin(serviceUrl: string, gradeAttemptId: string): Promise<boolean> {
    return this._serviceWorks;
  }
  async checkCoverage(badge: string, percentage: number): Promise<boolean> {
    return this._coverage;
  }
  getHostnameFromWebsite(website: string): string {
    return 'hostname.mock';
  }
}
