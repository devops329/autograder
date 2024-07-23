import { DB } from '../../model/dao/mysql/Database';
import { PizzaFactory } from '../../model/dao/pizzaFactory/PizzaFactory';
import { User } from '../../model/domain/User';
import { ChaosService } from '../../model/service/ChaosService';
import { Grader } from './Grader';

export class DeliverableTen implements Grader {
  async grade(user: User): Promise<[string]> {
    const chaosService = new ChaosService(new DB(), new PizzaFactory());
    await chaosService.addChaosToBeTriggered(user.netId);
    return ['The chaos has been triggered for you. Good luck!'];
  }
}
