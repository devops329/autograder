import { User } from '../../model/domain/User';

export interface Grader {
  grade(user: User): Promise<[number | string, object?]>;
}
