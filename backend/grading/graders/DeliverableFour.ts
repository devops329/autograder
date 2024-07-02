import { User } from '../../model/domain/User';
import { Github } from '../tools/Github';
import { Grader } from './Grader';

export class DeliverableFour implements Grader {
  async grade(user: User): Promise<[number]> {
    let score = 0;
    const github = new Github(user, 'jwt-pizza');

    // Read workflow file
    const workflowFile = await github.readWorkflowFile();
    const runsTest = workflowFile.includes('npm test');
    if (runsTest) score += 10;

    // Get current version
    const versionNumber = await github.getVersionNumber();

    // Run the workflow
    await github.triggerWorkflow();

    // Check for successful run
    const run = await github.getMostRecentRun();
    if (run && run.conclusion === 'success') score += 50;

    // Get new version number
    const newVersionNumber = await github.getVersionNumber();
    if (versionNumber && newVersionNumber && newVersionNumber != versionNumber) score += 10;

    // Get coverage badge
    const coverageBadge = await github.readCoverageBadge();
    console.log(coverageBadge);

    return [score];
  }
}
