export class ClientCommunicator {
  // private SERVER_URL: string;
  // constructor(SERVER_URL: string) {
  // 	this.SERVER_URL = SERVER_URL;
  // }

  async doPost(body: unknown, endpoint: string): Promise<JSON> {
    const url = '/api/' + endpoint;
    const request = {
      method: 'post',
      headers: new Headers({
        'Content-type': 'application/json',
      }),
      body: JSON.stringify(body),
    };
    try {
      const resp = await fetch(url, request);
      if (resp.ok) {
        const response = await resp.json();
        return response;
      } else {
        const error = await resp.json();
        throw new Error(error.errorMessage);
      }
    } catch (err) {
      throw new Error('Client communicator doPost failed:\n' + (err as Error).message);
    }
  }
}
