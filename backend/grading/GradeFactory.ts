import { Grader } from './graders/Grader';

export interface GradeFactory {
  deliverableOne: Grader;
  deliverableTwo: Grader;
  deliverableThree: Grader;
  deliverableFour: Grader;
  deliverableFive: Grader;
  deliverableSix: Grader;
  deliverableSeven: Grader;
  deliverableElevenPartOne: Grader;
  deliverableElevenPartTwo: Grader;
  deliverableTwelve: Grader;
}
