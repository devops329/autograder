import { DB } from '../../model/dao/mysql/Database';
import { User } from '../../model/domain/User';
import { CommitHistory } from '../tools/CommitHistory';
import { Github } from '../tools/Github';
import { Grader } from './Grader';

interface Rubric {
  commitHistory: number;
  lintSuccess: number;
  testSuccess: number;
  versionIncrement: number;
  coverage: number;
}

export class DeliverableThree implements Grader {
  async grade(user: User): Promise<[number, object]> {
    let score = 0;
    const rubric: Rubric = {
      commitHistory: 0,
      testSuccess: 0,
      lintSuccess: 0,
      versionIncrement: 0,
      coverage: 0,
    };

    // Check commit history
    const github = new Github(user, 'jwt-pizza-service');
    const db = new DB();
    const repo = 'jwt-pizza-service';
    const deliverable = 3;
    const dueDate = new Date('2024-9-20');
    const minimumCommits = 10;
    const commitPoints = 20;
    const commitHistory = new CommitHistory(db, user, repo, deliverable, dueDate, minimumCommits, commitPoints);
    const commitScore = await commitHistory.checkCommitHistory();
    score += commitScore;
    rubric.commitHistory = commitScore;

    // Read workflow file
    const workflowFile = await github.readWorkflowFile();
    const runsLint = workflowFile.includes('npm run lint');
    if (runsLint) {
      score += 5;
      rubric.lintSuccess += 5;
    }
    const runsTest = workflowFile.includes('npm test');
    if (runsTest) {
      score += 5;
      rubric.testSuccess += 5;
    }

    // Get current version
    const versionNumber = await github.getVersionNumber();
    // Run the workflow
    const triggeredWorkflow = await github.triggerWorkflow();
    if (!triggeredWorkflow) {
      return [score, rubric];
    }

    // Check for successful run
    const run = await github.getMostRecentRun();
    if (runsLint && runsTest && run.conclusion === 'success') {
      score += 10;
      rubric.lintSuccess += 5;
      rubric.testSuccess += 5;
    }

    // Get new version number
    const newVersionNumber = await github.getVersionNumber();
    if (newVersionNumber && newVersionNumber != versionNumber) {
      score += 5;
      rubric.versionIncrement += 5;
    }

    // Get coverage badge
    const coverageBadge = await github.readCoverageBadge();
    if (coverageBadge) {
      // check the svg code contains a number >= 80
      // example match <title xmlns="http://www.w3.org/2000/svg">Coverage: 92.41%</title>
      const regex = /Coverage: (\d+\.\d+)%/;
      const matches = coverageBadge.match(regex);
      if (matches && parseFloat(matches[1]) >= 80) {
        score += 55;
        rubric.coverage += 55;
      }
    }

    return [score, rubric];
  }
}
