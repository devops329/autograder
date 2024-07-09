import { Github } from './Github';

export class Commits {
  private github: Github;
  constructor(github: Github) {
    this.github = github;
  }

  async checkCommitHistory(deliverable: number, dueDate: Date, minimumCommits: number): Promise<number> {
    const commits = await this.getCommitsForDeliverableBeforeDeadline(deliverable, dueDate);
    if (!commits) return 0;
    let points = 0;
    points += await this.computeMinimumCommitsPoints(commits, minimumCommits);
    console.log('Minimum commits points', points);
    points += await this.hasHalfOfMinimumBeforeDueDate(commits, dueDate, minimumCommits);
    console.log('Half of minimum before due date points', points);
    return points;
  }

  async getCommitsForDeliverableBeforeDeadline(deliverable: number, dueDate: Date): Promise<object[]> {
    const commits = await this.github.getCommits();
    const regex = new RegExp(`#[dD]${deliverable}`, 'g');
    const deliverableCommits = commits.filter((commit: any) => {
      const isBeforeDueDate = new Date(commit.commit.author.date) <= dueDate;
      return isBeforeDueDate && regex.test(commit.commit.message);
    });
    console.log('Deliverable commits', deliverableCommits.length);
    return deliverableCommits;
  }

  async computeMinimumCommitsPoints(commits: object[], minimumCommits: number): Promise<number> {
    return commits.length >= minimumCommits ? 10 : 10 - minimumCommits + commits.length;
  }

  async hasHalfOfMinimumBeforeDueDate(commits: object[], dueDate: Date, minimumCommits: number): Promise<number> {
    const dueDateDay = dueDate.getDate();
    const commitsBeforeDueDate = commits.filter((commit: any) => {
      const commitDate = new Date(commit.commit.author.date).getDate();
      return commitDate < dueDateDay;
    });
    console.log('Commits before due date:', commitsBeforeDueDate.length);
    return commitsBeforeDueDate.length >= Math.floor(minimumCommits / 2) ? 10 : commitsBeforeDueDate.length * 2;
  }
}
