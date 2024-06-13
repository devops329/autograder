import { Submission } from '../model/domain/Submission';
import { User } from '../model/domain/User';
import { UserService } from '../model/service/UserService';

export interface AuthenticateView {
  setLoggedInUser(user: User | null): void;
  setSubmissions(submissions: Submission[]): void;
}
export class AuthenticatePresenter {
  private userService: UserService;
  private view: AuthenticateView;
  constructor(view: AuthenticateView) {
    this.view = view;
    this.userService = new UserService();
  }

  async login() {
    // const originalUrl = window.location.href;
    // window.location.href = `/api/login?redirectUrl=${originalUrl}`;
    const [user, submissions] = await this.userService.login();
    console.log('Logged in as', user);
    this.view.setLoggedInUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    this.view.setSubmissions(submissions);
    localStorage.setItem('submissions', JSON.stringify(submissions));
  }

  async logout() {
    await this.userService.logout();
    console.log('Logged out');
    this.view.setLoggedInUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('submissions');
  }
}
