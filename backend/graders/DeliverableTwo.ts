import { DB } from '../model/dao/mysql/Database';
import { DeliverableOneGrader } from './DeliverableOne';
import { Grader } from './Grader';

export class DeliverableTwoGrader implements Grader {
  async grade(netid: string): Promise<number> {
    const db = new DB();
    const hostname = (await db.getUser(netid))?.website;

    if (!hostname) {
      console.error('No hostname found for user:', netid);
      return 0;
    }

    const deliverableOne = new DeliverableOneGrader();
    const deliverableOneScore = await deliverableOne.grade(netid);

    return deliverableOneScore;
  }
}
