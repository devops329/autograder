import { User } from '../../model/domain/User';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

export class DeliverableFour implements Grader {
  async grade(user: User): Promise<number> {
    let score = 0;
    const tools = new GradingTools();

    // Read workflow file
    const workflowFile = await tools.readWorkflowFile(user, 'jwt-pizza');
    const runsTest = workflowFile.includes('npm test');
    if (runsTest) score += 10;

    // Get current version
    const versionNumber = await tools.getVersionNumber(user, 'jwt-pizza');

    // Run the workflow
    await tools.triggerWorkflow(user, 'jwt-pizza');

    // Check for successful run
    const run = await tools.getMostRecentRun(user, 'jwt-pizza');
    if (run && run.conclusion === 'success') score += 50;

    // Get new version number
    const newVersionNumber = await tools.getVersionNumber(user, 'jwt-pizza');
    if (versionNumber && newVersionNumber && newVersionNumber != versionNumber) score += 10;

    // Get coverage badge
    const coverageBadge = await tools.readCoverageBadge(user, 'jwt-pizza');
    console.log(coverageBadge);

    return score;
  }
}
