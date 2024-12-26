import { User } from '../../model/domain/User';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

interface DeliverableOneRubric {
  repoExists: number;
  taAddedAsCollaborator: number;
  comments: string;
}

export class DeliverableOne implements Grader {
  private tools: GradingTools;
  private github: Github = new Github();

  constructor(tools: GradingTools) {
    this.tools = tools;
  }
  async grade(user: User, gradeAttemptId: string): Promise<[number, DeliverableOneRubric]> {
    let score = 0;
    const rubric: DeliverableOneRubric = {
      repoExists: 0,
      taAddedAsCollaborator: 0,
      comments: '',
    };

    // Read notes.md file from student's fork of jwt-pizza repo
    const notesFile = await this.github.readGithubFile(user, 'jwt-pizza', 'notes.md', gradeAttemptId);
    if (!notesFile) {
      rubric.comments = 'Could not read notes.md file';
      return [0, rubric];
    }
    rubric.repoExists += 40;
    score += 40;

    // Check that the TA has been added as a collaborator

    return [score, rubric];
  }
}
