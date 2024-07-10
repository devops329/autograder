import { User } from '../../model/domain/User';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

interface Rubric {
  lintSuccess: number;
  testSuccess: number;
  versionIncrement: number;
  coverage: number;
}

export class DeliverableThree implements Grader {
  async grade(user: User): Promise<[number, object]> {
    let score = 0;
    const rubric: Rubric = {
      testSuccess: 0,
      lintSuccess: 0,
      versionIncrement: 0,
      coverage: 0,
    };
    const tools = new GradingTools();

    // Check commit history
    const github = new Github(user, 'jwt-pizza-service');

    // Read workflow file
    const workflowFile = await github.readWorkflowFile();
    const runsLint = workflowFile.includes('npm run lint');
    if (runsLint) {
      score += 5;
      rubric.lintSuccess += 5;
    }
    const runsTest = workflowFile.includes('npm test');
    if (runsTest) {
      score += 5;
      rubric.testSuccess += 5;
    }

    // Get current version
    const versionNumber = await github.getVersionNumber();
    // Run the workflow
    const triggeredWorkflow = await github.triggerWorkflow();
    if (!triggeredWorkflow) {
      return [score, rubric];
    }

    // Check for successful run
    const run = await github.getMostRecentRun();
    if (runsLint && runsTest && run.conclusion === 'success') {
      score += 10;
      rubric.lintSuccess += 5;
      rubric.testSuccess += 15;
    }

    // Get new version number
    const newVersionNumber = await github.getVersionNumber();
    if (newVersionNumber && newVersionNumber != versionNumber) {
      score += 5;
      rubric.versionIncrement += 5;
    }

    // Get coverage badge
    const coverageBadge = await github.readCoverageBadge();
    if (await tools.checkCoverage(coverageBadge, 55)) {
      score += 65;
      rubric.coverage += 65;
    }

    return [score, rubric];
  }
}
