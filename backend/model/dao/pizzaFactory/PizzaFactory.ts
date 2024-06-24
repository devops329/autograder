import { config } from '../../../config';

export class PizzaFactory {
  async getApiKey(netid: string, name: string) {
    try {
      const response = await fetch(`${config.pizza_factory.url}/api/admin/vendor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.pizza_factory.authtoken}`,
        },
        body: JSON.stringify({
          id: netid,
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
    try {
      const response = await fetch(`${config.pizza_factory.url}/api/admin/vendor/${apiKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.pizza_factory.authtoken}`,
        },
        body: JSON.stringify({ chaos: { type: 'throttle', resolveUrl: `https://${config.app.hostname}/api/report` } }),
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
      console.log('Attempted to resolve chaos. Response: ', data);
      return response.ok;
    } catch (error) {
      console.error(error);
    }
  }
}
