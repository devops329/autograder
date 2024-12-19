import { ServerFacade } from '../network/ServerFacade';

export interface AdminLoginView {
  setErrorMessage: (errorMessage: string | null) => void;
  setNetId: (netId: string) => void;
  setPassword: (password: string) => void;
}

export class AdminLoginPresenter {
  private view: AdminLoginView;
  constructor(view: AdminLoginView) {
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
