import { User } from '../../model/domain/User';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

export class DeliverableFive implements Grader {
  async grade(user: User): Promise<[number]> {
    let score = 0;
    const github = new Github(user, 'jwt-pizza');
    const tools = new GradingTools();

    // Read workflow file
    const workflowFile = await github.readWorkflowFile();
    const pushesToS3 = workflowFile.includes('aws s3 cp');

    // Run the workflow
    await github.triggerWorkflow();

    // Check for successful run
    const run = await github.getMostRecentRun();
    if (pushesToS3 && run.conclusion === 'success') score += 40;

    // Check cloudfront deployment
    const cloudfrontDeployed = await tools.checkDNS(user.website, /cloudfront\.net/);
    const pageExists = await tools.checkPageExists(user.website, /JWT Pizza/g);
    if (cloudfrontDeployed && pageExists) score += 58;

    // Check handling of browser refresh React DOM Routing
    const handles404Routing = await tools.checkPageExists(user.website + '/garbage', /Oops/g);
    if (handles404Routing) score += 2;

    return [score];
  }
}
