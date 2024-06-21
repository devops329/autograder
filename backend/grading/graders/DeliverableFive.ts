import { User } from '../../model/domain/User';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

export class DeliverableFive implements Grader {
  async grade(user: User): Promise<number> {
    let score = 0;
    const tools = new GradingTools();

    // Read workflow file
    const workflowFile = await tools.readWorkflowFile(user, 'jwt-pizza');
    const pushesToS3 = workflowFile.includes('aws s3 cp');

    // Run the workflow
    await tools.triggerWorkflow(user, 'jwt-pizza');

    // Check for successful run
    const run = await tools.getMostRecentRun(user, 'jwt-pizza');
    if (pushesToS3 && run.conclusion === 'success') score += 40;

    // Check cloudfront deployment
    const cloudfrontDeployed = await tools.checkDNS(user.website, /cloudfront\.net/);
    const pageExists = await tools.checkPageExists(user.website, /JWT Pizza/g);
    if (cloudfrontDeployed && pageExists) score += 58;

    // Check handling of browser refresh React DOM Routing
    const handles404Routing = await tools.checkPageExists(user.website + '/garbage', /Oops/g);
    if (handles404Routing) score += 2;

    return score;
  }
}
