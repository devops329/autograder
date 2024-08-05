import { ServerFacade } from '../network/ServerFacade';

export class AdminPresenter {
  private serverFacade = new ServerFacade();
  async login(netId: string, password: string) {
    const success = await this.serverFacade.adminLogin(netId, password);
    if (success) {
      window.location.href = '/login';
    } else {
      console.error('Error logging in');
    }
  }
}
