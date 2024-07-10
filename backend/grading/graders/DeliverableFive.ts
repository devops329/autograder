import { User } from '../../model/domain/User';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

interface Rubric {
  pushesToS3: number;
  cloudfrontDeployment: number;
  handles404Routing: number;
}

export class DeliverableFive implements Grader {
  async grade(user: User): Promise<[number, object]> {
    let score = 0;
    const rubric: Rubric = {
      pushesToS3: 0,
      cloudfrontDeployment: 0,
      handles404Routing: 0,
    };
    const github = new Github(user, 'jwt-pizza');
    const tools = new GradingTools();

    // Read workflow file
    const workflowFile = await github.readWorkflowFile();
    const pushesToS3 = workflowFile.includes('aws s3 cp');

    // Run the workflow
    await github.triggerWorkflow();

    // Check for successful run
    const run = await github.getMostRecentRun();
    if (pushesToS3 && run.conclusion === 'success') {
      rubric.pushesToS3 = 45;
      score += 45;
    }

    // Check cloudfront deployment
    const cloudfrontDeployed = await tools.checkDNS(user.website, /cloudfront\.net/);
    const pageExists = await tools.checkPageExistsAndContainsText(user.website, /JWT Pizza/g);
    if (cloudfrontDeployed && pageExists) {
      rubric.cloudfrontDeployment = 45;
      score += 45;
    }

    // Check handling of browser refresh React DOM Routing
    const handles404Routing = await tools.checkPageExistsAndContainsText(user.website + '/garbage', /Oops/g);
    if (handles404Routing) {
      rubric.handles404Routing = 10;
      score += 10;
    }

    return [score, rubric];
  }
}
