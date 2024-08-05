import { ServerFacade } from '../network/ServerFacade';

export class AdminPresenter {
  private serverFacade = new ServerFacade();
  async login(username: string, password: string) {
    console.log(await this.serverFacade.adminLogin(username, password));
  }
}
