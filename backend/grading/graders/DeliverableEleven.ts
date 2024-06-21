import { DB } from '../../model/dao/mysql/Database';
import { User } from '../../model/domain/User';
import { Grader } from './Grader';

export class DeliverableElevenGrader implements Grader {
  async grade(user: User): Promise<string> {
    const db = new DB();
    let partner: User;
    let pentest = await db.getPentest(user.netId);

    if (pentest?.partnerId) {
      partner = (await db.getUser(pentest.partnerId))!;
    } else {
      const eligiblePartners = await db.getPentestPartners(user.netId);
      if (eligiblePartners.length === 0) {
        return 'No partners available';
      }
      const partnerId = eligiblePartners[Math.floor(Math.random() * eligiblePartners.length)].netId;
      partner = (await db.getUser(partnerId))!;
      db.updatePentestPartner(user.netId, partnerId);
      db.updatePentestPartner(partnerId, user.netId);
    }

    return 'Name: ' + partner.name + ', Email: ' + partner.email;
  }
}
