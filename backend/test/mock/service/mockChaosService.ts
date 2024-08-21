import { ChaosService } from '../../../model/service/ChaosService';

export class MockChaosService extends ChaosService {
  private _chaosScheduled: boolean = false;
  private _chaosTriggered: boolean = false;
  get chaosTriggered(): boolean {
    return this._chaosTriggered;
  }
  get chaosScheduled(): boolean {
    return this._chaosScheduled;
  }
  checkForChaosToBeTriggered(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  scheduleChaos(netId: string): Promise<void> {
    this._chaosScheduled = true;
    return Promise.resolve();
  }
  triggerChaos(netId: string): Promise<void> {
    this._chaosTriggered = true;
    return Promise.resolve();
  }
  resolveChaos(apiKey: string, fixCode: string): Promise<true | undefined> {
    throw new Error('Method not implemented.');
  }
}
