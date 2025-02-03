import { User } from '../../model/domain/User';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

interface DeliverableThreeRubric {
  lintSuccess: number;
  testSuccess: number;
  coverage: number;
  comments: string;
}

export class DeliverableThree implements Grader {
  private tools: GradingTools;
  private github: Github;

  constructor(tools: GradingTools, github: Github) {
    this.tools = tools;
    this.github = github;
  }

  async grade(user: User, gradeAttemptId: string): Promise<[number, DeliverableThreeRubric]> {
    let score = 0;
    const rubric: DeliverableThreeRubric = {
      testSuccess: 0,
      lintSuccess: 0,
      coverage: 0,
      comments: '',
    };

    // Read workflow file
    const workflowFile = await this.github.readWorkflowFile(user, 'jwt-pizza-service', gradeAttemptId);
    if (!workflowFile) {
      rubric.comments += 'Workflow file not found.\n';
      return [score, rubric];
    }
    const runsLint = workflowFile.includes('npm run lint');
    if (runsLint) {
      score += 5;
      rubric.lintSuccess += 5;
    } else {
      rubric.comments += 'Linting is not included in the workflow.\n';
    }
    const runsTest = workflowFile.includes('npm test') || workflowFile.includes('npm run test');
    if (runsTest) {
      score += 5;
      rubric.testSuccess += 5;

      // Run the workflow
      const success = await this.github.triggerWorkflowAndWaitForCompletion(user, 'jwt-pizza-service', 'ci.yml', gradeAttemptId);
      if (!success) {
        rubric.comments += 'Workflow could not be triggered. Did you add byucs329ta as a collaborator?\n';
        return [score, rubric];
      }

      // Check for successful run
      const runSuccess = await this.github.checkRecentRunSuccess(user, 'jwt-pizza-service', 'ci.yml', gradeAttemptId);
      if (runSuccess) {
        rubric.testSuccess += 15;
        score += 15;
        if (runsLint) {
          score += 5;
          rubric.lintSuccess += 5;
        }

        // Get coverage badge
        let coverageBadge =
          (await this.tools.getCoverageBadge(user.github, true)) ?? (await this.github.readCoverageBadge(user, 'jwt-pizza-service', gradeAttemptId));
        if (!coverageBadge) {
          rubric.comments += 'Coverage badge not found.\n';
          return [score, rubric];
        }

        const sufficientCoverage = await this.tools.checkCoverage(coverageBadge, 80);
        if (sufficientCoverage) {
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
