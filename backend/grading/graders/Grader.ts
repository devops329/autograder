import { User } from '../../model/domain/User';

export interface Grader {
  grade(user: User, gradeAttemptId: string): Promise<[number | string, object?]>;
}
