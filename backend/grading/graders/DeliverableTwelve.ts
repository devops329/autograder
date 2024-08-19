import { DB } from '../../model/dao/mysql/Database';
import { User } from '../../model/domain/User';
import { Grader } from './Grader';

export class DeliverableTwelve implements Grader {
  private db: DB;
  constructor(db: DB) {
    this.db = db;
  }

  async grade(user: User, gradeAttemptId: string): Promise<[string]> {
    let partner: User;
    let pentest = await this.db.getPentest(user.netId);

    if (pentest?.partnerId) {
      partner = (await this.db.getUser(pentest.partnerId))!;
    } else {
      const eligiblePartners = await this.db.getPentestPartners(user.netId);
      if (eligiblePartners.length === 0) {
        return ['No partners available. Try again later or contact the instructor.'];
      }
      const partnerId = eligiblePartners[Math.floor(Math.random() * eligiblePartners.length)].netId;
      partner = (await this.db.getUser(partnerId))!;
      this.db.updatePentestPartner(user.netId, partnerId);
      this.db.updatePentestPartner(partnerId, user.netId);
    }

    return [`Partner: ${partner.name}\nEmail: ${partner.email}\nPizza Url: ${partner.website}`];
  }
}
