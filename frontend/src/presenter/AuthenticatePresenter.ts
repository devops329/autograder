import { Submission } from '../model/domain/Submission';
import { User } from '../model/domain/User';
import { UserService } from '../model/service/UserService';

export interface AuthenticateView {
  setUser(user: User | null): void;
  setSubmissions(submissions: Submission[]): void;
}
export class AuthenticatePresenter {
  private userService: UserService;
  private view: AuthenticateView;
  constructor(view: AuthenticateView) {
    this.view = view;
    this.userService = new UserService();
  }

  async login(netId: string) {
    if (!netId) {
      return;
    }
    const originalUrl = window.location.href;
    const baseUrl = originalUrl.substring(0, originalUrl.lastIndexOf('/'));
    const redirectUrl = `${baseUrl}/login`;
    window.location.href = `/api/login?netId=${netId}&redirectUrl=${redirectUrl}`;
  }

  async getUserInfo() {
    const [user, submissions] = await this.userService.getUserInfo();
    this.view.setUser(user);
    if (user.isAdmin) {
      localStorage.setItem('isAdmin', 'true');
    }
    this.view.setSubmissions(submissions);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('submissions', JSON.stringify(submissions));
  }

  async logout() {
    localStorage.removeItem('impersonatedUser');
    localStorage.removeItem('impersonatedSubmissions');
    localStorage.removeItem('user');
    localStorage.removeItem('submissions');
    localStorage.removeItem('isAdmin');
    this.view.setUser(null);
    this.view.setSubmissions([]);
    const response = await this.userService.logout();
    console.log(response);
  }

  async impersonate(netId: string) {
    if (!netId) {
      return;
    }
    const [user, submissions] = await this.userService.getUserInfo(netId);
    this.view.setUser(user);
    this.view.setSubmissions(submissions);
    localStorage.setItem('impersonatedUser', JSON.stringify(user));
    localStorage.setItem('impersonatedSubmissions', JSON.stringify(submissions));
    window.location.reload();
  }

  async stopImpersonating() {
    const netId = User.fromJson(JSON.parse(localStorage.getItem('user')!)).netId;
    const [user, submissions] = await this.userService.getUserInfo(netId);
    this.view.setUser(user);
    this.view.setSubmissions(submissions);
    localStorage.removeItem('impersonatedUser');
    localStorage.removeItem('impersonatedSubmissions');
    window.location.reload();
  }
}
