import { config } from '../../../config';

export class PizzaFactory {
  async getApiKey(netid: string, name: string) {
    try {
      const response = await fetch(`${config.pizza_factory.url}/admin/vendor`, {
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
      const response = await fetch(`${config.pizza_factory.url}/admin/vendor/${apiKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.pizza_factory.authtoken}`,
        },
        body: JSON.stringify({ chaos: { type: 'throttle', resolveUrl: `https://${config.app.hostname}/api/report` } }),
      });
      return response.ok;
    } catch (error) {
      console.error(error);
    }
  }

  async resolveChaos(apiKey: string, fixCode: string) {
    try {
      const response = await fetch(`${config.pizza_factory.url}/support/${apiKey}/report/${fixCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error(error);
    }
  }
}
