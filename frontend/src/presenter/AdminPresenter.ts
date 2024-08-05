import { ServerFacade } from '../network/ServerFacade';

export interface AdminView {
  setErrorMessage: (errorMessage: string | null) => void;
  setNetId: (netId: string) => void;
  setPassword: (password: string) => void;
}

export class AdminPresenter {
  private view: AdminView;
  constructor(view: AdminView) {
    this.view = view;
  }

  private serverFacade = new ServerFacade();
  async login(netId: string, password: string) {
    const success = await this.serverFacade.adminLogin(netId, password);
    if (success) {
      window.location.href = '/login';
    } else {
      this.view.setErrorMessage('Invalid login');
      this.view.setNetId('');
      this.view.setPassword('');
    }
  }
}
