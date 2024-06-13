import { ServerFacade } from '../../network/ServerFacade';
import { Submission } from '../domain/Submission';
import { User } from '../domain/User';

export class UserService {
	private serverFacade = new ServerFacade();

	async login(): Promise<[User, Submission[]]> {
		return this.serverFacade.login();
	}

	async logout() {
		return true;
	}

	async getUserInfo(netId: string): Promise<User> {
		return this.serverFacade.getUserInfo(netId);
	}
}
