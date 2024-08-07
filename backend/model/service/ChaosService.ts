import logger from '../../logger';
import { DB } from '../dao/mysql/Database';
import { PizzaFactory } from '../dao/pizzaFactory/PizzaFactory';
import { GradeService } from './GradeService';
import { Canvas } from '../dao/canvas/Canvas';
import { DeliverableGradeFactory } from '../../grading/graders/DeliverableGradeFactory';
import { DateTime } from 'luxon';

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

  async addChaosToBeTriggered(netId: string) {
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
    logger.log('info', { type: 'chaos_scheduled' }, { netId });
  }

  async triggerChaos(netId: string) {
    const apiKey = (await this.db.getUser(netId))!.apiKey;
    await this.pizzaFactory.triggerChaos(apiKey);
    logger.log('info', { type: 'chaos_triggered' }, { netId });
  }

  async resolveChaos(apiKey: string, fixCode: string) {
    const chaosResolved = await this.pizzaFactory.resolveChaos(apiKey, fixCode);
    if (chaosResolved) {
      const user = await this.db.getUserByApiKey(apiKey);
      logger.log('info', { type: 'chaos_resolved' }, { netId: user!.netId });
      const gradeFactory = new DeliverableGradeFactory();
      const service = new GradeService(this.db, new Canvas(), gradeFactory);
      await service.gradeDeliverableEleven(user!);
      return true;
    }
  }
}
