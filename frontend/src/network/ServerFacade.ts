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

  async grade(assignmentPhase: number): Promise<Submission[]> {
    const endpoint = 'grade';
    const response: JSON[] = (await this.clientCommunicator.doPost({ assignmentPhase: assignmentPhase }, endpoint)) as unknown as JSON[];
    const submissions: Submission[] = [];
    for (const submission of response) {
      submissions.push(Submission.fromJson(submission));
    }
    return submissions;
  }

  async getUserInfo(netId: string): Promise<User> {
    const endpoint = 'user';
    const response: JSON = (await this.clientCommunicator.doPost({ netId }, endpoint)) as unknown as JSON;
    return User.fromJson(response);
  }

  async getSubmissions(netId: string): Promise<Submission[]> {
    const endpoint = 'submissions';
    const response: JSON[] = (await this.clientCommunicator.doPost({ netId }, endpoint)) as unknown as JSON[];
    const submissions: Submission[] = [];
    for (const submission of response) {
      submissions.push(Submission.fromJson(submission));
    }
    return submissions;
  }
}
