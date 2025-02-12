import { DeliverableStat } from '../model/domain/DeliverableStat';
import { Submission } from '../model/domain/Submission';
import { User } from '../model/domain/User';
import { ClientCommunicator } from './ClientCommunicator';

export class ServerFacade {
  private clientCommunicator = new ClientCommunicator();

  async adminLogin(netId: string, password: string): Promise<boolean> {
    const endpoint = 'admin';
    const success: boolean = (await this.clientCommunicator.doPost({ netId, password }, endpoint)) as unknown as boolean;
    return success;
  }

  async logOut(): Promise<void> {
    const endpoint = 'logout';
    await this.clientCommunicator.doPost({}, endpoint);
  }

  async grade(netId: string, assignmentPhase: number): Promise<[string, Submission[], JSON, User | null]> {
    const endpoint = 'grade';
    const response: { message: string; submissions: JSON[]; rubric: JSON; user: JSON } = (await this.clientCommunicator.doPost(
      { assignmentPhase, netId },
      endpoint
    )) as unknown as {
      message: string;
      submissions: JSON[];
      rubric: JSON;
      user: JSON;
    };
    let user: User | null = null;
    if (response.user) {
      user = User.fromJson(response.user);
    }
    const submissions: Submission[] = [];
    for (const submission of response.submissions) {
      submissions.push(Submission.fromJson(submission));
    }
    return [response.message, submissions, response.rubric, user];
  }

  async toggleSubmissionsEnabled(): Promise<boolean> {
    const endpoint = 'toggle-submissions';
    const response: boolean = (await this.clientCommunicator.doPost({}, endpoint)) as unknown as boolean;
    return response;
  }

  async getSubmissionsEnabled(): Promise<boolean> {
    const endpoint = 'submissions-enabled';
    const response: boolean = (await this.clientCommunicator.doPost({}, endpoint)) as unknown as boolean;
    return response;
  }

  async getUserInfo(netId?: string): Promise<[User, Submission[]] | null> {
    const endpoint = 'user';
    let response: { user: JSON; submissions: JSON[] };
    try {
      response = (await this.clientCommunicator.doPost({ netId }, endpoint)) as unknown as { user: JSON; submissions: JSON[] };
      const user = User.fromJson(response.user);
      const submissions: Submission[] = [];
      for (const submission of response.submissions) {
        submissions.push(Submission.fromJson(submission));
      }
      return [user, submissions];
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  async impersonateUser(searchString: string): Promise<[User, Submission[]] | null> {
    const endpoint = 'impersonate';
    let response: { user: JSON; submissions: JSON[] };
    try {
      response = (await this.clientCommunicator.doPost({ searchString }, endpoint)) as unknown as { user: JSON; submissions: JSON[] };
      const user = User.fromJson(response.user);
      const submissions: Submission[] = [];
      for (const submission of response.submissions) {
        submissions.push(Submission.fromJson(submission));
      }
      return [user, submissions];
    } catch (error) {
      console.error('Error impersonating user:', error);
      return null;
    }
  }

  async updateUserInfo(netId: string, website: string, github: string, email: string, graceDays: number): Promise<User> {
    const endpoint = 'update';
    const response: JSON = await this.clientCommunicator.doPost({ website, github, email, netId, graceDays }, endpoint);
    return User.fromJson(response);
  }

  async getStats(): Promise<Map<
    number,
    { studentsSubmitted: string[]; studentsOnTime: string[]; studentsLate: string[]; studentsNotSubmitted: string[] }
  > | null> {
    const endpoint = 'stats';
    const response: [[number, DeliverableStat]] = (await this.clientCommunicator.doPost({}, endpoint)) as unknown as [[number, DeliverableStat]];
    const statsMap = new Map<
      number,
      { studentsSubmitted: string[]; studentsOnTime: string[]; studentsLate: string[]; studentsNotSubmitted: string[] }
    >();
    for (const [key, value] of response) {
      statsMap.set(key, value);
    }
    return statsMap;
  }

  async listAdmins(): Promise<User[] | null> {
    const endpoint = 'admin/list';
    let response: JSON[];
    try {
      response = (await this.clientCommunicator.doPost({}, endpoint)) as unknown as JSON[];
      const admins: User[] = [];
      for (const admin of response) {
        admins.push(User.fromJson(admin));
      }
      return admins;
    } catch (error) {
      console.error('Error getting admin list:', error);
      return null;
    }
  }

  async removeAdmin(netId: string): Promise<User[] | null> {
    const endpoint = 'admin/remove';
    let response: JSON[];
    try {
      response = (await this.clientCommunicator.doPost({ netId }, endpoint)) as unknown as JSON[];
      const admins: User[] = [];
      for (const admin of response) {
        admins.push(User.fromJson(admin));
      }
      return admins;
    } catch (error) {
      console.error('Error getting admin list:', error);
      return null;
    }
  }

  async addAdmin(netId: string): Promise<User[] | null> {
    const endpoint = 'admin/add';
    let response: JSON[];
    try {
      response = (await this.clientCommunicator.doPost({ netId }, endpoint)) as unknown as JSON[];
      const admins: User[] = [];
      for (const admin of response) {
        admins.push(User.fromJson(admin));
      }
      return admins;
    } catch (error) {
      console.error('Error adding admin:', error);
      return null;
    }
  }

  async dropStudentData(): Promise<boolean> {
    const endpoint = 'drop-data';
    const response: boolean = (await this.clientCommunicator.doPost({}, endpoint)) as unknown as boolean;
    return response;
  }

  async restoreStudentData(): Promise<boolean> {
    const endpoint = 'restore-data';
    const response: boolean = (await this.clientCommunicator.doPost({}, endpoint)) as unknown as boolean;
    return response;
  }
}
