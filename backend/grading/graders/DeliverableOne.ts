import { User } from '../../model/domain/User';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

interface DeliverableOneRubric {
  repoExists: number;
  tableCompleted: number;
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
      tableCompleted: 0,
      taAddedAsCollaborator: 0,
      comments: '',
    };

    // Read notes.md file from student's fork of jwt-pizza repo
    const notesFile = await this.github.readGithubFile(user, 'jwt-pizza', 'notes.md', gradeAttemptId);
    if (!notesFile) {
      rubric.comments += 'Could not find notes.md file.\n';
      return [0, rubric];
    }
    rubric.repoExists += 25;
    score += 25;

    const [rows, emptyCells] = await this.tools.countRowsAndEmptyCellsInNotesTable(notesFile);
    // Make sure they haven't just removed rows, and allow for some empty cells
    // in case of formatting issues
    if (rows >= 18 && emptyCells <= 2) {
      rubric.tableCompleted += 50;
      score += 50;
    } else {
      rubric.comments += 'Table in notes.md is not filled out.\n';
    }

    // Check that the TA has been added as a collaborator
    const isCollaborator = await this.github.isCollaborator(user, 'jwt-pizza', 'byucs329ta', gradeAttemptId);
    if (!isCollaborator) {
      rubric.comments += 'TA has not been added as a collaborator.\n';
      return [score, rubric];
    }
    rubric.taAddedAsCollaborator += 25;
    score += 25;

    return [score, rubric];
  }
}
