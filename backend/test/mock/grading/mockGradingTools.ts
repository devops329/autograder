import { GradingTools } from '../../../grading/tools/GradingTools';

export class MockGradingTools implements GradingTools {
  checkDNS(hostname: string, regex: RegExp, gradeAttemptId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  checkPageExistsAndContainsText(hostname: string, regex: RegExp): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  readPageJson(hostname: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  getEnvVariable(envFile: string, variableName: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  createUserAndLogin(serviceUrl: string, gradeAttemptId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  checkCoverage(badge: string, percentage: number): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getHostnameFromWebsite(website: string): string {
    throw new Error('Method not implemented.');
  }
}
