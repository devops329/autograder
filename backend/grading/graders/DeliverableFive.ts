import { User } from '../../model/domain/User';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

interface DeliverableFiveRubric {
  pushesToS3: number;
  cloudfrontDeployment: number;
  handles404Routing: number;
  comments: string;
}

export class DeliverableFive implements Grader {
  async grade(user: User): Promise<[number, DeliverableFiveRubric]> {
    let score = 0;
    const rubric: DeliverableFiveRubric = {
      pushesToS3: 0,
      cloudfrontDeployment: 0,
      handles404Routing: 0,
      comments: '',
    };
    const github = new Github(user, 'jwt-pizza');
    const tools = new GradingTools();

    // Read workflow file
    const workflowFile = await github.readWorkflowFile();
    const pushesToS3 = workflowFile.includes('aws s3 cp');
    if (pushesToS3) {
      // Run the workflow
      await github.triggerWorkflowAndWaitForCompletion('ci.yml');

      // Check for successful run
      const runSuccess = await github.checkRecentRunSuccess('ci.yml');
      if (runSuccess) {
        rubric.pushesToS3 = 45;
        score += 45;
      } else {
        rubric.comments += 'Workflow did not complete successfully.\n';
      }

      // Check cloudfront deployment
      const cloudfrontDeployed = await tools.checkDNS(user.website, /cloudfront\.net/);
      const pageExists = await tools.checkPageExistsAndContainsText(user.website, /JWT Pizza/g);
      if (cloudfrontDeployed && pageExists) {
        rubric.cloudfrontDeployment = 45;
        score += 45;
      } else {
        rubric.comments += 'Cloudfront deployment failed.\n';
      }

      // Check handling of browser refresh React DOM Routing
      const handles404Routing = await tools.checkPageExistsAndContainsText(user.website + '/garbage', /JWT Pizza/g);
      if (handles404Routing) {
        rubric.handles404Routing = 10;
        score += 10;
      } else {
        rubric.comments += '404 routing failed.\n';
      }
    } else {
      rubric.comments += 'Workflow does not push to S3.\n';
    }

    return [score, rubric];
  }
}
