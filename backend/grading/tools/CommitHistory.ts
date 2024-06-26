import { s } from 'vite/dist/node/types.d-aGj9QkWt';
import { config } from '../../config';
import { DB } from '../../model/dao/mysql/Database';
import { User } from '../../model/domain/User';

export class CommitHistory {
  private db: DB;
  private points: number;
  private user: User;
  private repo: string;
  private deliverable: number;
  private days: number;
  private minimumCommits: number;
  constructor(db: DB, user: User, repo: string, deliverable: number, days: number = 2, minimumCommits: number = 5, points: number = 10) {
    this.db = db;
    this.user = user;
    this.repo = repo;
    this.deliverable = deliverable;
    this.days = days;
    this.minimumCommits = minimumCommits;
    this.points = points;
  }
  async getMostRecentSubmissionDate() {
    const mostRecentSubmission = await this.db.getMostRecentSubmissionOtherDeliverables(this.user.netId, this.deliverable);
    if (mostRecentSubmission) {
      console.log(mostRecentSubmission.date);
      return mostRecentSubmission.date;
    }
    return null;
  }

  async getCommitsSinceLastSubmission() {
    const mostRecentSubmissionDate = await this.getMostRecentSubmissionDate();
    const dateInISO = mostRecentSubmissionDate ? new Date(mostRecentSubmissionDate).toISOString() : null;
    const url = `https://api.github.com/repos/${this.user.github}/${this.repo}/commits${dateInISO ? '?since=' + dateInISO : ''}`;
    console.log(url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `token ${config.github.personal_access_token}`,
          Accept: 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          ref: 'main',
        }),
      });
      const commits = await response.json();
      console.log(commits);
      return commits;
    } catch (error) {
      console.error('Error triggering the action:', error);
    }
  }

  async checkCommitHistory() {
    const commits = await this.getCommitsSinceLastSubmission();

    // Unique days = 20% of points
    const uniqueDays = await this.getUniqueDaysCommittedOn(commits);
    if (uniqueDays < this.days) {
      this.points -= Math.floor(this.points * 0.2);
    }
    // Lose points for not meeting minimum commits
    if (commits.length < this.minimumCommits) {
      const missingCommits = this.minimumCommits - commits.length;
      this.points -= missingCommits * Math.floor(this.points / this.minimumCommits);
    }
  }

  async getUniqueDaysCommittedOn(commits: any[]) {
    const uniqueDays = new Set();
    for (const commit of commits) {
      const day = new Date(commit.commit.author.date).getDay();
      uniqueDays.add(day);
    }
    return uniqueDays.size;
  }
}
