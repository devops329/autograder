import { DB } from '../../model/dao/mysql/Database';
import { User } from '../../model/domain/User';
import { Grader } from './Grader';

interface DeliverableElevenRubric {
  issueResolvedInTime: number;
  comments: string;
}
export class DeliverableElevenPartTwo implements Grader {
  private db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async grade(user: User): Promise<[number, DeliverableElevenRubric]> {
    const rubric: DeliverableElevenRubric = {
      issueResolvedInTime: 0,
      comments: '',
    };
    let score = 80;
    rubric.issueResolvedInTime = 80;
    // get chaos time from chaos db
    const chaosTime = await this.db.getChaosTime(user.netId);
    // Add 6 hours to chaos time for cutoff
    const cutoff = new Date(chaosTime);
    cutoff.setHours(cutoff.getHours() + 6);
    // For every hour that the current time is past the cutoff, subtract 10 points
    const currentTime = new Date();
    if (currentTime > cutoff) {
      const hoursPast = Math.floor((currentTime.getTime() - cutoff.getTime()) / 3600000);
      score -= hoursPast * 10;
      rubric.issueResolvedInTime -= hoursPast * 10;
      rubric.comments += `Issue was resolved ${hoursPast} hours late.`;
    }
    // remove chaos from db
    this.db.deleteChaos(user.netId);

    // put user into pentest db
    this.db.putPentest(user.netId);
    return [score, rubric];
  }
}
