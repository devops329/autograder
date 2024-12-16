import { Submission } from '../../model/domain/Submission';
import { User } from '../../model/domain/User';

export const mockSubmission: Submission = new Submission('today', 0, 1000, 'rubric', 0);

export const mockSubmissions: Submission[] = [mockSubmission];

export const mockStudent = new User('student', 'student', 'student', 'student', 'student', 'student', 0, false);

export const mockStudentNoWebsiteOrGithub = new User('student', 'student', 'student', '', '', 'student', 0, false);

export const mockAdmin = new User('admin', 'admin', 'admin', 'admin', 'admin', 'admin', 0, true);

export const mockToken = 'mockToken';

export const mockNetId = 'mockNetId';

export const mockRelease = {
  id: '1.1.1',
  name: 'Release 20240806.210309',
};

export const mockRelease2 = {
  id: '1.1.2',
  name: 'Release 20240806.210310',
};

export const mockVersionJson = {
  version: '20240806.210309',
};

export const mockVersionJson2 = {
  version: '20240806.210310',
};
