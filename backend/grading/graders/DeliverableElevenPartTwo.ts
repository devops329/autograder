import { User } from '../../model/domain/User';
import { ChaosService } from '../../model/service/ChaosService';
import { Grader } from './Grader';

interface DeliverableElevenRubric {
  issueResolvedInTime: number;
  comments: string;
}
export class DeliverableElevenPartTwo implements Grader {
  private chaosService: ChaosService;

  constructor(chaosService: ChaosService) {
    this.chaosService = chaosService;
  }

  async grade(user: User): Promise<[number, DeliverableElevenRubric]> {
    // Start with full score
    const rubric: DeliverableElevenRubric = {
      issueResolvedInTime: 80,
      comments: '',
    };
    let score = 80;
    // get chaos time from chaos db
    const chaosTime = await this.chaosService.getChaosTime(user.netId);
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

    return [score, rubric];
  }
}
