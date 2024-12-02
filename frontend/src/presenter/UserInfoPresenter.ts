import { User } from '../model/domain/User';
import { UserService } from '../model/service/UserService';

export interface UserInfoView {
  setUpdated(updated: boolean): void;
  setUser(user: User): void;
  setWebsite(website: string): void;
}

export class UserInfoPresenter {
  private userService: UserService;
  private view: UserInfoView;
  constructor(view: UserInfoView) {
    this.userService = new UserService();
    this.view = view;
  }

  async updateUserInfo(netId: string, website: string, github: string, email: string, lateDays: number, impersonated?: boolean) {
    // Remove "https://" or "http://" from the beginning of the website
    website = website.replace(/^(https?:\/\/)/, '');
    // Remove trailing slashes from the website
    website = website.replace(/\/+$/, '');

    const user = await this.userService.updateUserInfo(netId, website, github, email, lateDays);
    if (user) {
      const key = impersonated ? 'impersonatedUser' : 'user';
      localStorage.setItem(key, JSON.stringify(user));
      this.view.setUser(user);
      this.view.setWebsite(user.website);
      this.view.setUpdated(true);
    }
  }
}
