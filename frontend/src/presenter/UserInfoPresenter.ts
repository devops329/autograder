import { User } from '../model/domain/User';
import { UserService } from '../model/service/UserService';

export interface UserInfoView {
  setUpdated(updated: boolean): void;
  setUser(user: User): void;
}

export class UserInfoPresenter {
  private userService: UserService;
  private view: UserInfoView;
  constructor(view: UserInfoView) {
    this.userService = new UserService();
    this.view = view;
  }

  async updateUserInfo(netId: string, website: string, github: string, email: string, impersonated?: boolean) {
    const user = await this.userService.updateUserInfo(netId, website, github, email);
    if (user) {
      const key = impersonated ? 'impersonatedUser' : 'user';
      localStorage.setItem(key, JSON.stringify(user));
      this.view.setUser(user);
      this.view.setUpdated(true);
    }
  }
}
