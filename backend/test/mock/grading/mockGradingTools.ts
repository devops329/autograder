import { GradingTools } from '../../../grading/tools/GradingTools';
import { mockVersionJson, mockVersionJson2 } from '../mockValues';

export class MockGradingTools implements GradingTools {
  private _pageExists: boolean = true;
  private _success404: boolean = true;
  private _dnsSuccess: boolean = true;
  private _coverage: boolean = true;
  private _serviceWorks: boolean = true;
  private _envVariable: string = 'mock';
  private _pageJson: object = mockVersionJson;
  private _updatePageJson: boolean = true;

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
  set pageJson(json: object) {
    this._pageJson = json;
  }
  set updatePageJson(value: boolean) {
    this._updatePageJson = value;
  }
  async checkDNS(hostname: string, regex: RegExp, gradeAttemptId: string): Promise<boolean> {
    return this._dnsSuccess;
  }

  async fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    return new Response();
  }
  async checkResponseHeadersForText(hostname: string, regex: RegExp): Promise<boolean> {
    return true;
  }
  async checkPageBodyForText(hostname: string, regex: RegExp): Promise<boolean> {
    if (hostname.includes('garbage')) {
      return this._success404;
    }
    return this._pageExists;
  }
  async readPageJson(hostname: string): Promise<any> {
    const json = this._pageJson;
    if (this._updatePageJson) {
      this._pageJson = this._pageJson === mockVersionJson ? mockVersionJson2 : mockVersionJson;
    }
    return json;
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
  async countRowsAndEmptyCellsInNotesTable(notesFile: string): Promise<number[]> {
    return [18, 0];
  }
}
