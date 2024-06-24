import { DB } from '../../model/dao/mysql/Database';
import { User } from '../../model/domain/User';
import { Grader } from './Grader';

export class DeliverableTenPartTwo implements Grader {
  async grade(user: User): Promise<number> {
    const db = new DB();
    let score = 100;
    // get chaos time from chaos db
    // Add 12 hours to chaos time for cutoff
    // For every hour that the current time is past the cutoff, subtract 5 points
    // put user into pentest db
    db.putPentest(user.netId);
    return 50;
  }
}
