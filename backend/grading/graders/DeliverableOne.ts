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
    rubric.repoExists += 15;
    score += 15;

    const [rows, emptyCells] = await this.tools.countRowsAndEmptyCellsInNotesTable(notesFile);
    if (rows === 0) {
      rubric.comments += 'Could not read table in notes.md. Does the table markdown look correct?\n';
      return [score, rubric];
    }
    // Make sure they haven't just removed rows, and allow for some empty cells
    // in case of formatting issues
    if (rows >= 18 && emptyCells <= 2) {
      // Basic check for logout database SQL and create store SQL
      const logoutSQL = 'DELETE FROM auth WHERE token=?';
      const createStoreSQL = 'INSERT INTO store (franchiseId, name) VALUES (?, ?)';
      if (notesFile.includes(logoutSQL) && notesFile.includes(createStoreSQL)) {
        rubric.tableCompleted += 30;
        score += 30;
      } else {
        rubric.comments += 'Table in notes.md is missing some content.\n';
      }
      rubric.tableCompleted += 40;
      score += 40;
    } else {
      rubric.comments += 'Table in notes.md is not filled out.\n';
    }

    // Check that the TA has been added as a collaborator
    const isCollaborator = await this.github.isCollaborator(user, 'jwt-pizza', 'byucs329ta', gradeAttemptId);
    if (!isCollaborator) {
      rubric.comments += 'TA has not been added as a collaborator.\n';
      return [score, rubric];
    }
    rubric.taAddedAsCollaborator += 15;
    score += 15;

    return [score, rubric];
  }
}
