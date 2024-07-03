import { DB } from '../../model/dao/mysql/Database';
import { User } from '../../model/domain/User';
import { CommitHistory } from '../tools/CommitHistory';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

interface Rubric {
  commitHistory: number;
  testSuccess: number;
  versionIncrement: number;
  coverage: number;
}

export class DeliverableFour implements Grader {
  async grade(user: User): Promise<[number, object]> {
    let score = 0;
    const rubric: Rubric = {
      commitHistory: 0,
      testSuccess: 0,
      versionIncrement: 0,
      coverage: 0,
    };
    const tools = new GradingTools();
    const github = new Github(user, 'jwt-pizza');
    const db = new DB();
    const repo = 'jwt-pizza';
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
    const runsTest = workflowFile.includes('npm test');
    if (runsTest) {
      score += 5;
      rubric.testSuccess = 5;
    }

    // Get current version
    const versionNumber = await github.getVersionNumber();

    // Run the workflow
    await github.triggerWorkflow();

    // Check for successful run
    const run = await github.getMostRecentRun();
    if (run && run.conclusion === 'success') {
      score += 5;
      rubric.testSuccess += 5;
    }

    // Get new version number
    const newVersionNumber = await github.getVersionNumber();
    if (versionNumber && newVersionNumber && newVersionNumber != versionNumber) {
      score += 5;
      rubric.versionIncrement += 5;
    }

    // Get coverage badge
    const coverageBadge = await github.readCoverageBadge();
    if (await tools.checkCoverage(coverageBadge, 55)) {
      score += 65;
      rubric.coverage += 65;
    }

    return [score, rubric];
  }
}
