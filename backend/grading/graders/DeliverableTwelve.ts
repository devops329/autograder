import { User } from '../../model/domain/User';
import { PenTestService } from '../../model/service/PenTestService';
import { Grader } from './Grader';

export class DeliverableTwelve implements Grader {
  private penTestService: PenTestService;
  constructor(penTestService: PenTestService) {
    this.penTestService = penTestService;
  }

  async grade(user: User): Promise<[string]> {
    await this.penTestService.optInForPentest(user.netId);

    let partner: User | null = await this.penTestService.getPentestPartner(user.netId);

    if (!partner) {
      return ['No partners available right now. Try again later or contact the instructor.'];
    }

    return [`Partner: ${partner.name}\nEmail: ${partner.email}\nPizza Url: ${partner.website}`];
  }
}
