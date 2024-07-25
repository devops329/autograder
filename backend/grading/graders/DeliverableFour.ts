import e from 'express';
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
  async grade(user: User): Promise<[number, DeliverableFourRubric]> {
    let score = 0;
    const rubric: DeliverableFourRubric = {
      testSuccess: 0,
      versionIncrement: 0,
      coverage: 0,
      comments: '',
    };
    const tools = new GradingTools();
    const github = new Github(user, 'jwt-pizza');

    // Read workflow file
    const workflowFile = await github.readWorkflowFile();
    const runsTest = workflowFile.includes('npm run test:coverage');
    if (runsTest) {
      score += 5;
      rubric.testSuccess = 5;

      // Get current version
      const versionNumber = await github.getVersionNumber('frontend');

      // Run the workflow
      const success = await github.triggerWorkflowAndWaitForCompletion('ci.yml');
      if (!success) {
        rubric.comments += 'Workflow could not be triggered. Did you add byucs329ta as a collaborator?\n';
        return [score, rubric];
      }

      // Check for successful run
      const runSuccess = await github.checkRecentRunSuccess('ci.yml');
      if (runSuccess) {
        score += 15;
        rubric.testSuccess += 15;

        // Get new version number
        const newVersionNumber = await github.getVersionNumber('frontend');
        if (newVersionNumber && newVersionNumber != versionNumber) {
          score += 10;
          rubric.versionIncrement += 10;
        } else {
          rubric.comments += 'Version number was not incremented.\n';
        }

        // Get coverage badge
        const coverageBadge = await github.readCoverageBadge();
        if (await tools.checkCoverage(coverageBadge, 80)) {
          score += 70;
          rubric.coverage += 70;
        } else {
          rubric.comments += 'Coverage did not exceed minimum threshold.\n';
        }
      } else {
        rubric.comments += 'Workflow did not run successfully.\n';
      }
    } else {
      rubric.comments += 'Workflow does not run tests.\n';
    }
    return [score, rubric];
  }
}
