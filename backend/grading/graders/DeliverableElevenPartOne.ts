import { User } from '../../model/domain/User';
import { ChaosService } from '../../model/service/ChaosService';
import { Grader } from './Grader';

export class DeliverableElevenPartOne implements Grader {
  private chaosService: ChaosService;
  constructor(chaosService: ChaosService) {
    this.chaosService = chaosService;
  }

  async grade(user: User): Promise<[string]> {
    await this.chaosService.scheduleChaos(user.netId);
    return ['The chaos has been scheduled for you. Good luck!'];
  }
}
