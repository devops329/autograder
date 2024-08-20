import { Submission } from '../../model/domain/Submission';
import { User } from '../../model/domain/User';

export const mockSubmission: Submission = new Submission('today', 0, 1000, 'rubric');

export const mockSubmissions: Submission[] = [mockSubmission];

export const mockStudent = new User('student', 'student', 'student', 'student', 'student', 'student', false);

export const mockStudentNoWebsiteOrGithub = new User('student', 'student', 'student', '', '', 'student', false);

export const mockAdmin = new User('admin', 'admin', 'admin', 'admin', 'admin', 'admin', true);

export const mockToken = 'mockToken';

export const mockNetId = 'mockNetId';
