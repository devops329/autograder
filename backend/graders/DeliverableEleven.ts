import { DB } from '../model/dao/mysql/Database';
import { User } from '../model/domain/User';
import { Grader } from './Grader';

export class DeliverableElevenGrader implements Grader {
  async grade(user: User): Promise<number> {
    // put user into pool of eligible students for deliverable 12
    const db = new DB();
    db.putPentest(user.netId);
    return 50;
  }
}
