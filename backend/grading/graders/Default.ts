import { User } from '../../model/domain/User';
import { Grader } from './Grader';

export class DefaultGrader implements Grader {
  async grade(user: User): Promise<number> {
    return 50;
  }
}
