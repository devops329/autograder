import { DB } from '../../model/dao/mysql/Database';
import { User } from '../../model/domain/User';

// minimum number of commits per assignment, and some need to be before the day it's due
export class CommitHistory {
  private db: DB;
  private points: 10 | 20;
  private user: User;
  private repo: string;
  private deliverable: number;
  private minimumCommits: number;
  private dueDate: Date;

  constructor(db: DB, user: User, repo: string, deliverable: number, dueDate: Date, minimumCommits: number = 5, points: 10 | 20 = 10) {
    this.db = db;
    this.user = user;
    this.repo = repo;
    this.deliverable = deliverable;
    this.minimumCommits = minimumCommits;
    this.points = points;
    this.dueDate = dueDate;
  }

  async checkCommitHistory() {
    const commits: any[] = await this.getCommitsSinceLastSubmission();
    const pointsPossible = this.points;

    // 60% of the points are for the number of commits
    if (commits.length < this.minimumCommits) {
      // Lose points for not meeting minimum commits
      const missingCommits = this.minimumCommits - commits.length;
      this.points -= missingCommits * Math.floor(pointsPossible / this.minimumCommits) * 0.6;
    }

    // 40% of the points are for the commits before the due date
    // Check that at least two commits are before the day of the due date
    const dueDate = this.dueDate.getDate();
    const commitsBeforeDueDate = commits.filter((commit: any) => {
      const commitDate = new Date(commit.commit.author.date).getDate();
      return commitDate >= dueDate;
    });

    if (commitsBeforeDueDate.length < 2) {
      // Lose points for not meeting minimum commits before due date
      const missingCommits = 2 - commitsBeforeDueDate.length;
      this.points -= (missingCommits / 2) * Math.floor(pointsPossible * 0.4);
    }

    console.log('Commit history points:', this.points);

    return this.points;
  }

  private async getMostRecentSubmissionDate() {
    const mostRecentSubmission = await this.db.getMostRecentSubmissionOtherDeliverables(this.user.netId, this.deliverable);
    if (mostRecentSubmission) {
      return mostRecentSubmission.date;
    }
    return null;
  }

  private async getCommitsSinceLastSubmission() {
    const mostRecentSubmissionDate = await this.getMostRecentSubmissionDate();
    const dateInISO = mostRecentSubmissionDate ? new Date(mostRecentSubmissionDate).toISOString() : null;
    const url = `https://api.github.com/repos/${this.user.github}/${this.repo}/commits${dateInISO ? '?since=' + dateInISO : ''}`;

    try {
      const response = await fetch(url);
      const commits = await response.json();
      return commits;
    } catch (error) {
      console.error('Error getting commits', error);
    }
  }
}
