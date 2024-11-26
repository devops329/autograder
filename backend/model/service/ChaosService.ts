import logger from '../../logger';
import { DB } from '../dao/mysql/Database';
import { PizzaFactory } from '../dao/pizzaFactory/PizzaFactory';
import { DateTime } from 'luxon';
import { User } from '../domain/User';

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
    for (const entry of chaosEntries) {
      // Check if chaos time has passed
      if (new Date() > new Date(entry.chaosTime)) {
        await this.triggerChaos(entry.netId);
        // update the triggered status in the database
        await this.db.updateChaosTriggeredStatus(entry.netId);
      }
    }
  }

  async scheduleChaos(netId: string) {
    const randomHours = 8 + Math.floor(Math.random() * 6);
    const randomMinutes = Math.floor(Math.random() * 60);
    const chaosTime = DateTime.now()
      .setZone('America/Denver')
      .plus({ days: 1 })
      .startOf('day')
      .plus({ hours: randomHours, minutes: randomMinutes })
      .toISO();

    // Put user and chaos time into chaos db
    await this.db.putChaos(netId, chaosTime!);
    logger.log('info', { type: 'chaos_scheduled', service: 'chaos_service' }, { netId, chaosTime });
  }

  async triggerChaos(netId: string) {
    const apiKey = (await this.db.getUser(netId))!.apiKey;
    await this.pizzaFactory.triggerChaos(apiKey);
    logger.log('info', { type: 'chaos_triggered', service: 'chaos_service' }, { netId });
  }

  async resolveChaos(apiKey: string, fixCode: string): Promise<User | null> {
    await this.pizzaFactory.resolveChaos(apiKey, fixCode);
    const user = await this.db.getUserByApiKey(apiKey);
    logger.log('info', { type: 'chaos_resolved', service: 'chaos_service' }, { netId: user!.netId });
    return user;
  }

  async getChaosTime(netId: string): Promise<string> {
    return await this.db.getChaosTime(netId);
  }

  async removeScheduledChaos(netId: string) {
    await this.db.deleteChaos(netId);
  }
}
