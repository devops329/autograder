import { DB } from '../../model/dao/mysql/Database';
import { PizzaFactory } from '../../model/dao/pizzaFactory/PizzaFactory';
import { User } from '../../model/domain/User';
import { ChaosService } from '../../model/service/ChaosService';
import { Grader } from './Grader';

export class DeliverableTen implements Grader {
  async grade(user: User): Promise<string> {
    // const db = new DB();
    // calculate random time up to 6 hours after 8am the following day
    // const chaosTime = new Date();
    // chaosTime.setHours(8);
    // chaosTime.setMinutes(0);
    // chaosTime.setDate(chaosTime.getDate() + 1);
    // chaosTime.setHours(chaosTime.getHours() + Math.floor(Math.random() * 6));
    // chaosTime.setMinutes(Math.floor(Math.random() * 60));
    // console.log('Chaos time:', chaosTime);
    // // put user into chaos db
    // db.putChaos(user.netId, chaosTime);
    // return 'The chaos will occur between 8am and 2pm tomorrow. Good luck!';

    const chaosService = new ChaosService(new DB(), new PizzaFactory());
    await chaosService.triggerChaos(user.netId);
    return 'The chaos has been triggered for you. Good luck!';
  }
}
