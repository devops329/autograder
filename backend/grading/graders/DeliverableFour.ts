import { User } from '../../model/domain/User';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

interface Rubric {
  testSuccess: number;
  versionIncrement: number;
  coverage: number;
}

export class DeliverableFour implements Grader {
  async grade(user: User): Promise<[number, object]> {
    let score = 0;
    const rubric: Rubric = {
      testSuccess: 0,
      versionIncrement: 0,
      coverage: 0,
    };
    const tools = new GradingTools();
    const github = new Github(user, 'jwt-pizza');

    // Read workflow file
    const workflowFile = await github.readWorkflowFile();
    const runsTest = workflowFile.includes('npm run test:coverage');
    if (runsTest) {
      score += 5;
      rubric.testSuccess = 5;
    }

    // Get current version
    const versionNumber = await github.getVersionNumber('frontend');

    // Run the workflow
    await github.triggerWorkflowAndWaitForCompletion('ci.yml');

    // Check for successful run
    const runSuccess = await github.checkRecentRunSuccess('ci.yml');
    if (runSuccess) {
      score += 15;
      rubric.testSuccess += 15;
    }

    // Get new version number
    const newVersionNumber = await github.getVersionNumber('frontend');
    if (newVersionNumber && newVersionNumber != versionNumber) {
      score += 10;
      rubric.versionIncrement += 10;
    }

    // Get coverage badge
    const coverageBadge = await github.readCoverageBadge();
    if (await tools.checkCoverage(coverageBadge, 55)) {
      score += 70;
      rubric.coverage += 70;
    }

    return [score, rubric];
  }
}
