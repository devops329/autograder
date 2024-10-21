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

  async grade(netId: string, assignmentPhase: number): Promise<[string, Submission[], JSON]> {
    const endpoint = 'grade';
    const response: { message: string; submissions: JSON[]; rubric: JSON } = (await this.clientCommunicator.doPost(
      { assignmentPhase, netId },
      endpoint
    )) as unknown as {
      message: string;
      submissions: JSON[];
      rubric: JSON;
    };
    const submissions: Submission[] = [];
    for (const submission of response.submissions) {
      submissions.push(Submission.fromJson(submission));
    }
    return [response.message, submissions, response.rubric];
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

  async updateUserInfo(netId: string, website: string, github: string, email: string): Promise<User> {
    const endpoint = 'update';
    const response: JSON = (await this.clientCommunicator.doPost({ website, github, email, netId }, endpoint)) as unknown as JSON;
    return User.fromJson(response);
  }

  async getStats(): Promise<object> {
    const endpoint = 'stats';
    const response: JSON = await this.clientCommunicator.doPost({}, endpoint);
    return response;
  }

  async getNetIdsForDeliverablePhase(phase: number): Promise<string[]> {
    const endpoint = 'stats/netids';
    const response: JSON = await this.clientCommunicator.doPost({ phase }, endpoint);
    return response as unknown as string[];
  }
}
