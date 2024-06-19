import { DB } from '../model/dao/mysql/Database';
import { User } from '../model/domain/User';
import { Grader } from './Grader';

export class DeliverableTenPartOneGrader implements Grader {
  async grade(user: User): Promise<number> {
    const db = new DB();
    // put user into chaos db
    // put user into pentest db
    db.putPentest(user.netId);
    return 50;
  }
}
