import { GradeFactory } from '../../../grading/GradeFactory';
import { Grader } from '../../../grading/graders/Grader';
import { MockGrader } from './mockGrader';

export class MockGradeFactory implements GradeFactory {
  deliverableOne: Grader = new MockGrader();
  deliverableTwo: Grader = new MockGrader();
  deliverableThree: Grader = new MockGrader();
  deliverableFour: Grader = new MockGrader();
  deliverableFive: Grader = new MockGrader();
  deliverableSix: Grader = new MockGrader();
  deliverableSeven: Grader = new MockGrader();
  deliverableElevenPartOne: Grader = new MockGrader();
  deliverableElevenPartTwo: Grader = new MockGrader();
  deliverableTwelve: Grader = new MockGrader();
}
