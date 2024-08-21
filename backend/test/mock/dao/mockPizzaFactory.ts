import { PizzaFactory } from '../../../model/dao/pizzaFactory/PizzaFactory';

export class MockPizzaFactory implements PizzaFactory {
  async getApiKey(netId: string, name: string): Promise<any> {
    return 'mockedApiKey';
  }
  async triggerChaos(apiKey: string): Promise<boolean | undefined> {
    return true;
  }
  async resolveChaos(apiKey: string, fixCode: string): Promise<boolean | undefined> {
    return true;
  }
}
