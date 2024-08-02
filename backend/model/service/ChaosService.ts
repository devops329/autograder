import { DeliverableElevenPartTwo } from '../../grading/graders/DeliverableElevenPartTwo';
import logger from '../../logger';
import { DB } from '../dao/mysql/Database';
import { PizzaFactory } from '../dao/pizzaFactory/PizzaFactory';
import { v4 as uuidv4 } from 'uuid';
import { GradeService } from './GradeService';
import { Canvas } from '../dao/canvas/Canvas';

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
    // Calculate random time up to 6 hours after 8am the following day
    const chaosTime = new Date();
    chaosTime.setHours(8);
    chaosTime.setMinutes(0);
    chaosTime.setDate(chaosTime.getDate() + 1);
    chaosTime.setHours(chaosTime.getHours() + Math.floor(Math.random() * 6));
    chaosTime.setMinutes(Math.floor(Math.random() * 60));
    // Put user and chaos time into chaos db
    await this.db.putChaos(netId, chaosTime);
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
      const service = new GradeService(this.db, new Canvas());
      await service.gradeDeliverableEleven(user!);
      return true;
    }
  }
}
