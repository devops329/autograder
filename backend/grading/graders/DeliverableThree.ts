import { User } from '../../model/domain/User';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

export class DeliverableThree implements Grader {
  async grade(user: User): Promise<number> {
    let score = 0;
    const tools = new GradingTools();

    // Read workflow file
    const workflowFile = await tools.readWorkflowFile(user, 'jwt-pizza-service');
    const runsLint = workflowFile.includes('npm run lint');
    if (runsLint) score += 10;
    const runsTest = workflowFile.includes('npm test');
    if (runsTest) score += 10;

    // Get current version
    const versionNumber = await tools.getVersionNumber(user, 'jwt-pizza-service');

    // Run the workflow
    await tools.triggerWorkflow(user, 'jwt-pizza-service');

    // Check for successful run
    const run = await tools.getMostRecentRun(user, 'jwt-pizza-service');
    if (run && run.conclusion === 'success') score += 50;

    // Get new version number
    const newVersionNumber = await tools.getVersionNumber(user, 'jwt-pizza-service');
    if (versionNumber && newVersionNumber && newVersionNumber != versionNumber) score += 10;

    // Get coverage badge
    const coverageBadge = await tools.readCoverageBadge(user, 'jwt-pizza-service');
    console.log(coverageBadge);

    return score;
  }
}
