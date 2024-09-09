import { config } from '../../../config';
import logger from '../../../logger';

export class PizzaFactory {
  async getApiKey(netId: string, name: string) {
    try {
      const response = await fetch(`${config.pizza_factory.url}/api/admin/vendor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.pizza_factory.authtoken}`,
        },
        body: JSON.stringify({
          id: netId,
          name: name,
        }),
      });
      const data = await response.json();
      return data.apiKey;
    } catch (error: any) {
      logger.log('error', { type: 'get_api_key', service: 'pizza_factory' }, { error: error.message });
    }
  }

  async triggerChaos(apiKey: string) {
    let chaosType: 'throttle' | 'fail' = Math.random() < 0.5 ? 'throttle' : 'fail';
    try {
      const response = await fetch(`${config.pizza_factory.url}/api/admin/vendor/${apiKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.pizza_factory.authtoken}`,
        },
        body: JSON.stringify({ chaos: { type: chaosType, resolveUrl: `${config.app.host}/api/report` } }),
      });
      return response.ok;
    } catch (error: any) {
      logger.log('error', { type: 'chaos_trigger', service: 'pizza_factory' }, { error: error.message });
    }
  }

  async resolveChaos(apiKey: string, fixCode: string) {
    try {
      const response = await fetch(`${config.pizza_factory.url}/api/support/${apiKey}/report/${fixCode}`);
      return response.ok;
    } catch (error: any) {
      logger.log('error', { type: 'chaos_resolve', service: 'pizza_factory' }, { error: error.message });
    }
  }
}
