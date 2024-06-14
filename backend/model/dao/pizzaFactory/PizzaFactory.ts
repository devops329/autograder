import { config } from '../../../config';

export class PizzaFactory {
  async getApiKey(netid: string, name: string) {
    try {
      const response = await fetch('https://pizza-factory.cs329.click/api/admin/vendor', {
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
}
