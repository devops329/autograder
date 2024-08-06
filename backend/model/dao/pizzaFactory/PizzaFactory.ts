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
    } catch (error) {
      console.error(error);
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
        body: JSON.stringify({ chaos: { type: chaosType, resolveUrl: `https://${config.app.host}/api/report` } }),
      });
      const data = await response.json();
      console.log('Attempted to trigger chaos. Response: ', data);
      return response.ok;
    } catch (error) {
      console.error(error);
    }
  }

  async resolveChaos(apiKey: string, fixCode: string) {
    try {
      const response = await fetch(`${config.pizza_factory.url}/api/support/${apiKey}/report/${fixCode}`);
      const data = await response.json();
      logger.log('info', { type: 'chaos_resolve' }, data);
      return response.ok;
    } catch (error) {
      console.error(error);
    }
  }
}
