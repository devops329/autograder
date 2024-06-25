import { DB } from '../../model/dao/mysql/Database';
import { User } from '../../model/domain/User';
import { Grader } from './Grader';

export class DeliverableTenPartTwo implements Grader {
  async grade(user: User): Promise<number> {
    const db = new DB();
    let score = 100;

    // get chaos time from chaos db
    const chaosTime = await db.getChaosTime(user.netId);
    // Add 12 hours to chaos time for cutoff
    const cutoff = new Date(chaosTime);
    cutoff.setHours(cutoff.getHours() + 12);
    // For every hour that the current time is past the cutoff, subtract 5 points
    const currentTime = new Date();
    if (currentTime > cutoff) {
      const hoursPast = Math.floor((currentTime.getTime() - cutoff.getTime()) / 3600000);
      score -= hoursPast * 5;
    }
    // remove chaos from db
    db.deleteChaos(user.netId);

    // put user into pentest db
    db.putPentest(user.netId);
    return score;
  }
}
