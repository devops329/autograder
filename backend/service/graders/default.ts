import { Grader } from './Grader';

export class DefaultGrader implements Grader {
  async grade(): Promise<number> {
    return 50;
  }
}
