import { Submission } from '../model/domain/Submission';
import { User } from '../model/domain/User';
import { UserService } from '../model/service/UserService';

export interface AuthenticateView {
  setLoggedInUser(user: User | null): void;
  setSubmissions(submissions: Submission[]): void;
  setImpersonatedUser(user: User): void;
}
export class AuthenticatePresenter {
  private userService: UserService;
  private view: AuthenticateView;
  constructor(view: AuthenticateView) {
    this.view = view;
    this.userService = new UserService();
  }

  async login() {
    const originalUrl = window.location.href;
    const baseUrl = originalUrl.substring(0, originalUrl.lastIndexOf('/'));
    const redirectUrl = `${baseUrl}/login`;
    window.location.href = `/api/login?redirectUrl=${redirectUrl}`;
  }

  async getUserInfo() {
    const [user, submissions] = await this.userService.getUserInfo();
    this.view.setLoggedInUser(user);
    this.view.setSubmissions(submissions);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('submissions', JSON.stringify(submissions));
  }

  async logout() {
    const response = await this.userService.logout();
    console.log(response);
    this.view.setLoggedInUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('submissions');
  }

  async impersonate(netId: string) {
    const [user, submissions] = await this.userService.getUserInfo(netId);
    this.view.setImpersonatedUser(user);
    this.view.setSubmissions(submissions);
    localStorage.setItem('impersonatedUser', JSON.stringify(user));
    localStorage.setItem('submissions', JSON.stringify(submissions));
  }

  async stopImpersonating(netId: string) {
    const [user, submissions] = await this.userService.getUserInfo(netId);
    this.view.setLoggedInUser(user);
    this.view.setSubmissions(submissions);
    localStorage.removeItem('impersonatedUser');
    window.location.reload();
  }
}
