import { User } from '../../model/domain/User';
import { DeliverableOne } from './DeliverableOne';
import { Grader } from './Grader';
import { Github } from '../tools/Github';

interface DeliverableTwoRubric {
  deployedToPages: number;
  deployedScore: number;
  comments: string;
}

export class DeliverableTwo implements Grader {
  async grade(user: User, gradeAttemptId: string): Promise<[number, DeliverableTwoRubric]> {
    const rubric: DeliverableTwoRubric = {
      deployedToPages: 0,
      deployedScore: 0,
      comments: '',
    };
    const hostname = user.website;
    const github = new Github(user, 'jwt-pizza');
    let score = 0;

    if (!hostname) {
      rubric.comments += 'No website provided.\n';
      return [score, rubric];
    }

    // Read workflow file
    const workflowFileContents = await github.readWorkflowFile(gradeAttemptId);
    const deployedToPages = workflowFileContents.includes('actions/deploy-pages');
    if (!deployedToPages) {
      rubric.comments += 'Your GitHub Action workflow does not deploy to GitHub Pages.\n';
      return [score, rubric];
    }
    score += 30;
    rubric.deployedToPages += 30;

    const success = await github.triggerWorkflowAndWaitForCompletion('ci.yml', gradeAttemptId);
    if (!success) {
      rubric.comments += 'Workflow could not be triggered. Did you add byucs329ta as a collaborator?\n';
      return [score, rubric];
    }

    // Check for successful deployment
    const deliverableOne = new DeliverableOne();
    const deployedScore = (await deliverableOne.grade(user, gradeAttemptId))[0] * 0.7;
    const deliverableOneRubric = (await deliverableOne.grade(user, gradeAttemptId))[1];
    rubric.comments += deliverableOneRubric.comments;
    score += deployedScore;
    rubric.deployedScore += deployedScore;

    return [score, rubric];
  }
}
