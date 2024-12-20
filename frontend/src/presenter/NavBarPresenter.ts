import { Submission } from '../model/domain/Submission';
import { User } from '../model/domain/User';
import { UserService } from '../model/service/UserService';

export interface NavBarView {
  setUser(user: User | null): void;
  setSubmissions(submissions: Submission[]): void;
  setErrorMessage(errorMessage: string | null): void;
  setImpersonateSearchString?(netId: string): void;
}
export class NavBarPresenter {
  private userService: UserService;
  private view: NavBarView;
  constructor(view: NavBarView) {
    this.view = view;
    this.userService = new UserService();
  }

  async logIn() {
    const originalUrl = window.location.href;
    const baseUrl = originalUrl.substring(0, originalUrl.lastIndexOf('/'));
    const redirectUrl = `${baseUrl}/login`;
    window.location.href = `/api/login?redirectUrl=${redirectUrl}`;
  }

  async getUserInfo() {
    const data = await this.userService.getUserInfo();
    if (!data) {
      return;
    }
    const [user, submissions] = data;
    this.view.setUser(user);
    if (user.isAdmin) {
      localStorage.setItem('isAdmin', 'true');
    }
    this.view.setSubmissions(submissions);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('submissions', JSON.stringify(submissions));
  }

  async logOut() {
    localStorage.removeItem('impersonatedUser');
    localStorage.removeItem('impersonatedSubmissions');
    localStorage.removeItem('user');
    localStorage.removeItem('submissions');
    localStorage.removeItem('isAdmin');
    this.view.setUser(null);
    this.view.setSubmissions([]);
    this.userService.logOut();
    window.location.href = '/';
  }

  async impersonate(searchString: string) {
    if (!searchString) {
      return;
    }
    const data = await this.userService.impersonateUser(searchString);
    if (!data) {
      this.view.setErrorMessage('Student not found');
      if (this.view.setImpersonateSearchString) {
        this.view.setImpersonateSearchString('');
      }
      return;
    }
    const [user, submissions] = data;
    this.view.setUser(user);
    this.view.setSubmissions(submissions);
    localStorage.setItem('impersonatedUser', JSON.stringify(user));
    localStorage.setItem('impersonatedSubmissions', JSON.stringify(submissions));
    window.location.reload();
  }

  async stopImpersonating() {
    const netId = User.fromJson(JSON.parse(localStorage.getItem('user')!)).netId;
    const data = await this.userService.getUserInfo(netId);
    if (!data) {
      return;
    }
    const [user, submissions] = data;
    this.view.setUser(user);
    this.view.setSubmissions(submissions);
    localStorage.removeItem('impersonatedUser');
    localStorage.removeItem('impersonatedSubmissions');
    window.location.reload();
  }
}
