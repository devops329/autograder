export interface Grader {
  grade(netid: string): Promise<number>;
}
