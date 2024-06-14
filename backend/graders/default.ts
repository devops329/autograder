import { Grader } from './Grader';

export class DefaultGrader implements Grader {
  async grade(netid: string): Promise<number> {
    return 50;
  }
}
