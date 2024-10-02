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
  private tools: GradingTools;
  private github: Github;

  constructor(tools: GradingTools, github: Github) {
    this.tools = tools;
    this.github = github;
  }

  async grade(user: User, gradeAttemptId: string): Promise<[number, DeliverableFiveRubric]> {
    let score = 0;
    const rubric: DeliverableFiveRubric = {
      pushesToS3: 0,
      cloudfrontDeployment: 0,
      handles404Routing: 0,
      comments: '',
    };

    // Read workflow file
    const workflowFile = await this.github.readWorkflowFile(user, 'jwt-pizza', gradeAttemptId);
    if (!workflowFile) {
      rubric.comments += 'Workflow file not found.\n';
      return [score, rubric];
    }
    const pushesToS3 = workflowFile.includes('aws s3 cp');
    if (pushesToS3) {
      // Run the workflow
      const success = await this.github.triggerWorkflowAndWaitForCompletion(user, 'jwt-pizza', 'ci.yml', gradeAttemptId);
      if (!success) {
        rubric.comments += 'Workflow could not be triggered. Did you add byucs329ta as a collaborator?\n';
        return [score, rubric];
      }

      // Check for successful run
      const runSuccess = await this.github.checkRecentRunSuccess(user, 'jwt-pizza', 'ci.yml', gradeAttemptId);
      if (runSuccess) {
        rubric.pushesToS3 = 45;
        score += 45;
      } else {
        rubric.comments += 'Workflow did not complete successfully.\n';
        return [score, rubric];
      }

      // Check cloudfront deployment
      const cloudfrontDeployed = await this.tools.checkResponseHeadersForText(user.website, /cloudfront\.net/);
      const pageExists = await this.tools.checkPageBodyForText(user.website, /JWT Pizza/g);
      if (cloudfrontDeployed && pageExists) {
        rubric.cloudfrontDeployment = 45;
        score += 45;
      } else {
        rubric.comments += 'Cloudfront deployment failed.\n';
        return [score, rubric];
      }

      // Check handling of browser refresh React DOM Routing
      const handles404Routing = await this.tools.checkPageBodyForText(user.website + '/garbage', /JWT Pizza/g);
      if (handles404Routing) {
        rubric.handles404Routing = 10;
        score += 10;
      } else {
        rubric.comments += '404 routing failed.\n';
        return [score, rubric];
      }
    } else {
      rubric.comments += 'Workflow does not push to S3.\n';
    }

    return [score, rubric];
  }
}
