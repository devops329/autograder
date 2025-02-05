import { User } from '../../model/domain/User';
import { DeliverableOne } from './DeliverableOne';
import { Grader } from './Grader';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';

interface DeliverableTwoRubric {
  functionalJwtPizza: number;
  deployedWithActionsToPages: number;
  versionIncrement: number;
  pipelineBadge: number;
  comments: string;
}

export class DeliverableTwo implements Grader {
  private github: Github;
  private tools: GradingTools;

  constructor(github: Github, tools: GradingTools) {
    this.github = github;
    this.tools = tools;
  }
  async grade(user: User, gradeAttemptId: string): Promise<[number, DeliverableTwoRubric]> {
    const rubric: DeliverableTwoRubric = {
      functionalJwtPizza: 0,
      deployedWithActionsToPages: 0,
      versionIncrement: 0,
      pipelineBadge: 0,
      comments: '',
    };
    let score = 0;

    // Check they have a website
    const hostname = user.website;
    if (!hostname) {
      rubric.comments += 'No website provided.\n';
      return [0, rubric];
    }

    // Get current version in github
    const versionNumber = (await this.tools.readPageJson(hostname + '/version.json'))?.version;
    if (!versionNumber) {
      rubric.comments += 'Version number not found. Have you deployed the app yet?\n';
      return [score, rubric];
    }

    // Read workflow file
    const workflowFile = await this.github.readWorkflowFile(user, 'jwt-pizza', gradeAttemptId);
    if (!workflowFile) {
      rubric.comments += 'Workflow file not found.\n';
      return [score, rubric];
    }

    // Check for github action that deploys to pages
    const deployedToPages = workflowFile.includes('actions/deploy-pages');
    if (!deployedToPages) {
      rubric.comments += 'Your workflow does not deploy to GitHub Pages.\n';
      return [score, rubric];
    }
    score += 10;
    rubric.deployedWithActionsToPages += 10;

    const success = await this.github.triggerWorkflowAndWaitForCompletion(user, 'jwt-pizza', 'ci.yml', gradeAttemptId);
    if (!success) {
      rubric.comments += 'Workflow could not be triggered. Did you add byucs329ta as a collaborator?\n';
      return [score, rubric];
    }

    // Check for successful deployment
    let deployedWithCustomDomainName = false;
    let githubPagesSuccess = false;

    // Check that the JWT Pizza content is at the custom domain
    deployedWithCustomDomainName = await this.tools.checkPageBodyForText(hostname, /JWT Pizza/g);
    // Check for a CNAME that points to github pages
    githubPagesSuccess = await this.tools.checkDNS(hostname, /github\.io/, gradeAttemptId);

    if (deployedWithCustomDomainName) {
      score += 35;
      rubric.functionalJwtPizza += 35;
    } else {
      rubric.comments += 'JWT Pizza is not functional at the provided website.\n';
    }

    if (githubPagesSuccess) {
      score += 20;
      rubric.deployedWithActionsToPages += 20;

      if (deployedWithCustomDomainName) {
        score += 20;
        rubric.deployedWithActionsToPages += 20;
      }
    } else {
      rubric.comments += 'Your website is not hosted by GitHub Pages.\n';
    }

    // Get new version number
    const newVersionNumber = (await this.tools.readPageJson(hostname + '/version.json'))?.version;
    if (newVersionNumber && newVersionNumber != versionNumber) {
      score += 10;
      rubric.versionIncrement += 10;
    } else {
      rubric.comments += 'Version number was not incremented.\n';
    }

    // Check for pipeline badge
    const readme = await this.github.readGithubFile(user, 'jwt-pizza', 'README.md', gradeAttemptId);
    if (!readme) {
      rubric.comments += 'README.md not found, so could not read pipeline badge.\n';
      return [score, rubric];
    }
    if (readme.includes('badge.svg')) {
      score += 5;
      rubric.pipelineBadge += 5;
    } else {
      rubric.comments += 'Pipeline badge not found in README.md.\n';
    }

    return [score, rubric];
  }
}
