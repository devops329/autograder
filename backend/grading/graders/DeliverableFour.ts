import { User } from '../../model/domain/User';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

interface DeliverableFourRubric {
  testSuccess: number;
  versionIncrement: number;
  coverage: number;
  comments: string;
}

export class DeliverableFour implements Grader {
  private tools: GradingTools;
  private github: Github;

  constructor(tools: GradingTools, github: Github) {
    this.tools = tools;
    this.github = github;
  }

  async grade(user: User, gradeAttemptId: string): Promise<[number, DeliverableFourRubric]> {
    let score = 0;
    const rubric: DeliverableFourRubric = {
      testSuccess: 0,
      versionIncrement: 0,
      coverage: 0,
      comments: '',
    };

    // Read workflow file
    const workflowFile = await this.github.readWorkflowFile(user, 'jwt-pizza', gradeAttemptId);
    if (!workflowFile) {
      rubric.comments += 'Workflow file not found.\n';
      return [score, rubric];
    }
    const runsTest = workflowFile.includes('npm run test:coverage');
    if (runsTest) {
      score += 5;
      rubric.testSuccess = 5;

      // Get current version
      const versionNumber = await this.github.getVersionNumber(user, 'jwt-pizza', 'frontend', gradeAttemptId);

      // Run the workflow
      const success = await this.github.triggerWorkflowAndWaitForCompletion(user, 'jwt-pizza', 'ci.yml', gradeAttemptId);
      if (!success) {
        rubric.comments += 'Workflow could not be triggered. Did you add byucs329ta as a collaborator?\n';
        return [score, rubric];
      }

      // Check for successful run
      const runSuccess = await this.github.checkRecentRunSuccess(user, 'jwt-pizza', 'ci.yml', gradeAttemptId);
      if (runSuccess) {
        score += 15;
        rubric.testSuccess += 15;

        // Get new version number
        const newVersionNumber = await this.github.getVersionNumber(user, 'jwt-pizza', 'frontend', gradeAttemptId);
        if (newVersionNumber && newVersionNumber != versionNumber) {
          score += 10;
          rubric.versionIncrement += 10;
        } else {
          rubric.comments += 'Version number was not incremented.\n';
        }

        // Get coverage badge
        const coverageBadge = await this.github.readCoverageBadge(user, 'jwt-pizza', gradeAttemptId);
        if (await this.tools.checkCoverage(coverageBadge, 80)) {
          score += 70;
          rubric.coverage += 70;
        } else {
          rubric.comments += 'Coverage did not exceed minimum threshold.\n';
        }
      } else {
        rubric.comments += 'Workflow did not succeed.\n';
      }
    } else {
      rubric.comments += 'Testing is not included in the workflow.\n';
    }
    return [score, rubric];
  }
}
