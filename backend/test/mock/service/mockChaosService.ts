import { User } from '../../../model/domain/User';
import { ChaosService } from '../../../model/service/ChaosService';

export class MockChaosService extends ChaosService {
  private _chaosTime: string = '';
  private _chaosScheduled: boolean = false;
  set chaosTime(time: string) {
    this._chaosTime = time;
  }
  get chaosScheduled(): boolean {
    return this._chaosScheduled;
  }
  async checkForChaosToBeTriggered(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async scheduleChaos(netId: string): Promise<void> {
    this._chaosScheduled = true;
  }
  async triggerChaos(netId: string): Promise<void> {}

  async resolveChaos(apiKey: string, fixCode: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async getChaosTime(netId: string) {
    return this._chaosTime;
  }

  async removeScheduledChaos(netId: string) {
    return;
  }
}
