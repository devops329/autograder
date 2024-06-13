export interface Grader {
  grade(): Promise<number>;
}
