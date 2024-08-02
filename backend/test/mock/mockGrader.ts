import { Grader } from '../../grading/graders/Grader';
import { Submission } from '../../model/domain/Submission';
import { User } from '../../model/domain/User';

export class MockGrader implements Grader {
  async grade(user: User, gradeAttemptId: string): Promise<[string, object]> {
    return ['fake score', { fake: 'data' }];
  }
}
