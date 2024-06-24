import { DB } from '../../model/dao/mysql/Database';
import { User } from '../../model/domain/User';
import { Grader } from './Grader';

export class DeliverableTen implements Grader {
  async start(user: User): Promise<string> {
    const db = new DB();
    // calculate random time up to 6 hours after 8am the following day
    const chaosTime = new Date();
    chaosTime.setHours(8);
    chaosTime.setMinutes(0);
    chaosTime.setDate(chaosTime.getDate() + 1);
    chaosTime.setHours(chaosTime.getHours() + Math.floor(Math.random() * 6));
    chaosTime.setMinutes(Math.floor(Math.random() * 60));
    console.log('Chaos time:', chaosTime);
    // put user into chaos db
    db.putChaos(user.netId, chaosTime);
    return 'The chaos will occur between 8am and 2pm tomorrow. Good luck!';
  }
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