import { DB } from '../dao/mysql/Database';

export class ChaosService {
  private db: DB;
  constructor(db: DB) {
    this.db = db;
  }
  async checkForChaosToBeTriggered() {
    // Check database for untriggered chaos
    const chaosEntries = await this.db.getUntriggeredChaos();
    // Check if chaos time has passed, if so trigger chaos
    for (const entry of chaosEntries) {
      if (new Date() > new Date(entry.chaosTime)) {
        await this.triggerChaos(entry.netId);
        // update the triggered status
        await this.db.triggerChaos(entry.netId);
        console.log('Chaos triggered for:', entry.netId);
      }
    }
  }

  async triggerChaos(netId: string) {
    //
  }

  async resolveChaos(netId: string) {
    // Send a request to the factory endpoint
    // If the response is 200, grade the deliverable
  }
}
