import { User } from '../../model/domain/User';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

interface DeliverableFourRubric {
  testSuccess: number;
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
      score += 15;
      rubric.testSuccess = 15;

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

        // Get coverage badge
        const coverageBadge =
          (await this.github.readCoverageBadge(user, 'jwt-pizza', gradeAttemptId)) ?? (await this.tools.getCoverageBadge(user.github, false));
        if (!coverageBadge) {
          rubric.comments += 'Coverage badge not found.\n';
          return [score, rubric];
        }
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
