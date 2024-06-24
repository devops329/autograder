import { DB } from '../dao/mysql/Database';
import { PizzaFactory } from '../dao/pizzaFactory/PizzaFactory';

export class ChaosService {
  private db: DB;
  private pizzaFactory: PizzaFactory;
  constructor(db: DB, pizzaFactory: PizzaFactory) {
    this.db = db;
    this.pizzaFactory = pizzaFactory;
  }
  async checkForChaosToBeTriggered() {
    // Check database for untriggered chaos
    const chaosEntries = await this.db.getUntriggeredChaos();
    // Check if chaos time has passed, if so trigger chaos
    for (const entry of chaosEntries) {
      if (new Date() > new Date(entry.chaosTime)) {
        await this.triggerChaos(entry.netId);
        // update the triggered status in the database
        await this.db.triggerChaos(entry.netId);
      }
    }
  }

  async triggerChaos(netId: string) {
    const apiKey = (await this.db.getUser(netId))!.apiKey;
    console.log(apiKey);
    await this.pizzaFactory.triggerChaos(apiKey);
    console.log('Chaos triggered for:', netId);
  }

  async resolveChaos(apiKey: string, fixCode: string) {
    const chaosResolved = await this.pizzaFactory.resolveChaos(apiKey, fixCode);
    if (chaosResolved) {
      console.log('Chaos resolved');
      return true;
    }
  }
}
