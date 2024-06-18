import { Submission } from '../model/domain/Submission';
import { User } from '../model/domain/User';
import { ClientCommunicator } from './ClientCommunicator';

export class ServerFacade {
  private clientCommunicator = new ClientCommunicator();

  async login(): Promise<[User, Submission[]]> {
    const endpoint = 'login';
    const response: { user: JSON; submissions: JSON[] } = (await this.clientCommunicator.doPost({}, endpoint)) as unknown as {
      user: JSON;
      submissions: JSON[];
    };

    const user = User.fromJson(response.user);
    const submissions: Submission[] = [];
    for (const submission of response.submissions) {
      submissions.push(Submission.fromJson(submission));
    }

    return [user, submissions];
  }

  async logout(): Promise<string> {
    const endpoint = 'logout';
    const response: { msg: string } = (await this.clientCommunicator.doPost({}, endpoint)) as unknown as { msg: string };
    return response.msg;
  }

  async grade(assignmentPhase: number): Promise<[string, Submission[]]> {
    const endpoint = 'grade';
    const response: { score: string; submissions: JSON[] } = (await this.clientCommunicator.doPost({ assignmentPhase: assignmentPhase }, endpoint)) as unknown as {
      score: string;
      submissions: JSON[];
    };
    const submissions: Submission[] = [];
    for (const submission of response.submissions) {
      submissions.push(Submission.fromJson(submission));
    }
    return [response.score, submissions];
  }

  async getUserInfo(): Promise<[User, Submission[]]> {
    const endpoint = 'user';
    const response: { user: JSON; submissions: JSON[] } = (await this.clientCommunicator.doPost({}, endpoint)) as unknown as { user: JSON; submissions: JSON[] };
    const user = User.fromJson(response.user);
    const submissions: Submission[] = [];
    for (const submission of response.submissions) {
      submissions.push(Submission.fromJson(submission));
    }
    return [user, submissions];
  }

  async updateUserInfo(website: string, github: string, email: string): Promise<User> {
    const endpoint = 'update';
    const response: JSON = (await this.clientCommunicator.doPost({ website, github, email }, endpoint)) as unknown as JSON;
    return User.fromJson(response);
  }

  async getStudentInfo(netId: string): Promise<[User, Submission[]]> {
    const endpoint = 'admin/user';
    const response: { user: JSON; submissions: JSON[] } = (await this.clientCommunicator.doPost({ netId }, endpoint)) as unknown as { user: JSON; submissions: JSON[] };
    console.log('admin', response);
    const user = User.fromJson(response.user);
    console.log(user);
    const submissions: Submission[] = [];
    for (const submission of response.submissions) {
      submissions.push(Submission.fromJson(submission));
    }
    return [user, submissions];
  }
}
