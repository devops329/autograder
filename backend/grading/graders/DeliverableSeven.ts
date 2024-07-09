import { User } from '../../model/domain/User';
import { Grader } from './Grader';

export class DeliverableSeven implements Grader {
  async grade(user: User): Promise<[number | string, object]> {
    return [0, {}];
  }
}
