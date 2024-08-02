import { GradeFactory } from '../GradeFactory';
import { DeliverableElevenPartOne } from './DeliverableElevenPartOne';
import { DeliverableElevenPartTwo } from './DeliverableElevenPartTwo';
import { DeliverableFive } from './DeliverableFive';
import { DeliverableFour } from './DeliverableFour';
import { DeliverableOne } from './DeliverableOne';
import { DeliverableSeven } from './DeliverableSeven';
import { DeliverableSix } from './DeliverableSix';
import { DeliverableThree } from './DeliverableThree';
import { DeliverableTwelve } from './DeliverableTwelve';
import { DeliverableTwo } from './DeliverableTwo';

import { Grader } from './Grader';

export class DeliverableGradeFactory implements GradeFactory {
  deliverableOne: Grader = new DeliverableOne();
  deliverableTwo: Grader = new DeliverableTwo();
  deliverableThree: Grader = new DeliverableThree();
  deliverableFour: Grader = new DeliverableFour();
  deliverableFive: Grader = new DeliverableFive();
  deliverableSix: Grader = new DeliverableSix();
  deliverableSeven: Grader = new DeliverableSeven();
  deliverableElevenPartOne: Grader = new DeliverableElevenPartOne();
  deliverableElevenPartTwo: Grader = new DeliverableElevenPartTwo();
  deliverableTwelve: Grader = new DeliverableTwelve();
}
